'use client';

import { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    suggestions: string[];
    className?: string;
    onSelect?: (value: string) => void;
}

export function AutocompleteInput({
    value,
    onChange,
    placeholder,
    suggestions,
    className = '',
    onSelect,
}: AutocompleteInputProps) {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.trim().length > 0) {
            const filtered = suggestions
                .filter((suggestion) =>
                    suggestion.toLowerCase().includes(value.toLowerCase())
                )
                .slice(0, 10); // Limit to 10 suggestions
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
        setActiveIndex(-1);
    }, [value, suggestions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
        if (onSelect) {
            onSelect(suggestion);
        }
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
                    handleSelect(filteredSuggestions[activeIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setActiveIndex(-1);
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                    if (filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={suggestion}
                            onClick={() => handleSelect(suggestion)}
                            className={`cursor-pointer px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 ${
                                index === activeIndex ? 'bg-gray-100' : ''}`}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

