'use client';

import { useEffect, useRef, useState } from 'react';

import { Loader2, MapPin } from 'lucide-react';

import { AutocompleteInput } from '@/components/dashboard/AutocompleteInput';
import { DEFAULT_COUNTRY_CONFIG, getCountryConfig, getCountryNames, type CountryConfig } from '@/lib/country-data';

export interface AddressData {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

interface AddressFormProps {
    address: AddressData;
    onAddressChange: (address: AddressData) => void;
}

export function AddressForm({ address, onAddressChange }: AddressFormProps) {
    const [countryConfig, setCountryConfig] = useState<CountryConfig>(DEFAULT_COUNTRY_CONFIG);
    const [isAutocompleting, setIsAutocompleting] = useState(false);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Update country config when country changes
    useEffect(() => {
        const config = getCountryConfig(address.country);
        setCountryConfig(config);
        // Clear state when country changes if the new country doesn't have states
        if (!config.hasState && address.state) {
            onAddressChange({ ...address, state: '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address.country]);

    // Common cities for autocomplete (can be enhanced with API)
    const getCitySuggestions = (country: string): string[] => {
        const cityMap: Record<string, string[]> = {
            'United States': [
                'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
                'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
                'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
            ],
            'Canada': [
                'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
                'Quebec City', 'Hamilton', 'Kitchener',
            ],
            'United Kingdom': [
                'London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Edinburgh',
                'Bristol', 'Cardiff', 'Belfast',
            ],
            'Australia': [
                'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle',
                'Canberra', 'Sunshine Coast', 'Wollongong',
            ],
        };
        return cityMap[country] || [];
    };

    // Handle address autocomplete using a simple approach
    // In production, you'd use Google Places API or similar
    const handleAddressAutocomplete = async (value: string) => {
        if (value.length < 3) return;

        // Clear previous timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce the autocomplete
        debounceTimerRef.current = setTimeout(async () => {
            setIsAutocompleting(true);
            try {
                // TODO: Integrate with Google Places API or similar service
                // For now, this is a placeholder that could be enhanced
                // Example: const response = await fetch(`/api/places/autocomplete?input=${value}`);
                
                // Simulate API call delay
                await new Promise((resolve) => setTimeout(resolve, 300));
                
                // In a real implementation, you would:
                // 1. Call Google Places Autocomplete API
                // 2. Parse the response
                // 3. Update address fields based on the selected result
                
            } catch (error) {
                console.error('Address autocomplete error:', error);
            } finally {
                setIsAutocompleting(false);
            }
        }, 500);
    };

    const handleInputChange = (field: keyof AddressData, value: string) => {
        const newAddress = { ...address, [field]: value };
        onAddressChange(newAddress);

        // Trigger autocomplete for address line 1
        if (field === 'addressLine1') {
            handleAddressAutocomplete(value);
        }
    };

    const countryNames = getCountryNames();

    return (
        <div className="space-y-4">
            {/* Country Selection */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                <AutocompleteInput
                    value={address.country}
                    onChange={(value) => handleInputChange('country', value)}
                    placeholder="Select country"
                    suggestions={countryNames}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
            </div>

            {/* Address Line 1 */}
            <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">Street Address</label>
                <div className="relative">
                    <input
                        ref={addressInputRef}
                        type="text"
                        value={address.addressLine1}
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="123 Main St"
                    />
                    {isAutocompleting && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    )}
                    {!isAutocompleting && address.addressLine1 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Start typing your address for autocomplete suggestions
                </p>
            </div>

            {/* Address Line 2 (Apartment, etc.) */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {countryConfig.addressLine2Label}
                </label>
                <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Apt 4B, Unit 5, etc."
                />
            </div>

            {/* City and State/Province */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
                    <AutocompleteInput
                        value={address.city}
                        onChange={(value) => handleInputChange('city', value)}
                        placeholder="City"
                        suggestions={getCitySuggestions(address.country)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                </div>
                {countryConfig.hasState ? (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            {countryConfig.stateLabel}
                        </label>
                        {countryConfig.states && countryConfig.states.length > 0 ? (
                            <AutocompleteInput
                                value={address.state}
                                onChange={(value) => handleInputChange('state', value)}
                                placeholder={countryConfig.stateLabel}
                                suggestions={countryConfig.states}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                            />
                        ) : (
                            <input
                                type="text"
                                value={address.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                placeholder={countryConfig.stateLabel}
                            />
                        )}
                    </div>
                ) : null}
            </div>

            {/* Postal Code */}
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {countryConfig.postalCodeLabel}
                </label>
                <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder={countryConfig.postalCodeLabel}
                    pattern={countryConfig.postalCodePattern?.source}
                />
                {countryConfig.postalCodePattern && (
                    <p className="mt-1 text-xs text-gray-500">
                        Format: {countryConfig.postalCodePattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '')}
                    </p>
                )}
            </div>
        </div>
    );
}

