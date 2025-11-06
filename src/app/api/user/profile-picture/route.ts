import { auth } from '@/lib/auth';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env/server';

async function deleteUploadthingFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl || !fileUrl.startsWith('https://utfs.io/')) {
    console.log('File URL is not from uploadthing, skipping deletion:', fileUrl);
    return false;
  }

  try {
    // Extract file key from uploadthing URL
    // Uploadthing URLs are typically: https://utfs.io/f/{fileKey}
    const urlParts = fileUrl.split('/f/');
    if (urlParts.length < 2) {
      console.warn('Could not extract file key from URL:', fileUrl);
      return false;
    }
    
    const fileKey = urlParts[1]?.split('?')[0]?.trim();
    if (!fileKey) {
      console.warn('File key is empty after extraction from URL:', fileUrl);
      return false;
    }

    const uploadthingSecret = env.UPLOADTHING_SECRET || process.env.UPLOADTHING_SECRET;
    if (!uploadthingSecret) {
      console.warn('UPLOADTHING_SECRET not set, cannot delete file');
      return false;
    }

    console.log('Deleting file from uploadthing with key:', fileKey);
    console.log('Secret length:', uploadthingSecret.length);
    console.log('Secret starts with:', uploadthingSecret.substring(0, 20));

    // UploadThing v6 delete API - try different header formats
    let response;
    try {
      // First try with X-Uploadthing-Secret (standard v6 format)
      response = await fetch('https://api.uploadthing.com/v6/deleteFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Uploadthing-Secret': uploadthingSecret,
        },
        body: JSON.stringify({ fileKeys: [fileKey] }),
      });

      // If that fails with 400, try with Authorization header
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: await response.text() }));
        console.log('First attempt failed, trying Authorization header:', errorData);
        
        response = await fetch('https://api.uploadthing.com/v6/deleteFile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uploadthingSecret}`,
          },
          body: JSON.stringify({ fileKeys: [fileKey] }),
        });
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return false;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Uploadthing delete API error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Successfully deleted file from uploadthing:', fileKey, result);
    return true;
  } catch (error) {
    console.error('Error deleting file from uploadthing:', error);
    return false;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, oldImageKey } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Get current user data to check for old image
    const currentUser = await db.select({ image: user.image }).from(user).where(eq(user.id, session.user.id)).limit(1);
    const currentImageUrl = currentUser[0]?.image;

    // Update user with new image URL
    await db.update(user).set({ image: imageUrl }).where(eq(user.id, session.user.id));

    // Delete old image from uploadthing
    // Priority: oldImageKey (from upload response) > currentImageUrl (from DB)
    if (oldImageKey) {
      // If we have the file key directly, use it
      const uploadthingSecret = env.UPLOADTHING_SECRET || process.env.UPLOADTHING_SECRET;
      if (uploadthingSecret) {
        try {
          const response = await fetch('https://api.uploadthing.com/v6/deleteFile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Uploadthing-Secret': uploadthingSecret,
            },
            body: JSON.stringify({ fileKeys: [oldImageKey] }),
          });
          if (response.ok) {
            console.log('Successfully deleted file using key:', oldImageKey);
          } else {
            const errorText = await response.text();
            console.error('Uploadthing delete API error:', response.status, errorText);
          }
        } catch (error) {
          console.error('Error deleting file by key:', error);
        }
      }
    } else if (currentImageUrl && currentImageUrl !== imageUrl) {
      // Fallback to deleting by URL
      await deleteUploadthingFile(currentImageUrl);
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user data to get the image URL
    const currentUser = await db.select({ image: user.image }).from(user).where(eq(user.id, session.user.id)).limit(1);
    const currentImageUrl = currentUser[0]?.image;

    console.log('Delete request - currentImageUrl:', currentImageUrl);

    // Delete the image from uploadthing if it exists and is from uploadthing
    let fileDeleted = false;
    if (currentImageUrl && currentImageUrl.startsWith('https://utfs.io/')) {
      console.log('Attempting to delete file from uploadthing:', currentImageUrl);
      fileDeleted = await deleteUploadthingFile(currentImageUrl);
    } else if (currentImageUrl) {
      console.log('Image is not from uploadthing, skipping file deletion:', currentImageUrl);
    }

    // Update user to remove image (even if file deletion failed)
    const updateResult = await db.update(user).set({ image: null }).where(eq(user.id, session.user.id));

    console.log('Database update result:', updateResult);
    console.log('Successfully deleted profile picture for user:', session.user.id, 'File deleted:', fileDeleted);

    return NextResponse.json({ 
      success: true, 
      fileDeleted,
      message: 'Profile picture deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
