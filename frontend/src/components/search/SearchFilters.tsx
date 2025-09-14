import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface SearchFiltersProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onFiltersChange?: (filters: {
    location: string;
    minPrice: string;
    maxPrice: string;
    propertyType: string;
    bedrooms: string;
    bathrooms: string;
    furnished: string;
    petsAllowed: string;
    parking: string;
    amenities: string;
  }) => void;
}

const SearchFilters = ({ isOpen = true, onToggle, onFiltersChange }: SearchFiltersProps) => {
  const [priceRange, setPriceRange] = useState([10000, 50000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOccupancy, setSelectedOccupancy] = useState<string[]>([]);

  const propertyTypes = [
    "Single Room",
    "Double Sharing",
    "Triple Sharing",
    "1BHK",
    "2BHK",
    "3BHK"
  ];

  const occupancyTypes = [
    "Married Couples",
    "Unmarried Couples",
    "Bachelors",
    "Students",
    "Working Professionals"
  ];

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  const handleOccupancyChange = (occupancy: string, checked: boolean) => {
    if (checked) {
      setSelectedOccupancy([...selectedOccupancy, occupancy]);
    } else {
      setSelectedOccupancy(selectedOccupancy.filter(o => o !== occupancy));
    }
  };

  const clearAllFilters = () => {
    setPriceRange([10000, 50000]);
    setSelectedTypes([]);
    setSelectedOccupancy([]);
  };

  // Call onFiltersChange when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        location: '',
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        propertyType: selectedTypes.join(','),
        bedrooms: '',
        bathrooms: '',
        furnished: '',
        petsAllowed: '',
        parking: '',
        amenities: selectedOccupancy.join(',')
      });
    }
  }, [priceRange, selectedTypes, selectedOccupancy, onFiltersChange]);

  return (
    <Card className="bg-gradient-card border-glass p-6 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-foreground font-semibold text-lg">Filters</h3>
        </div>
        {onToggle && (
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <Label className="text-foreground font-medium mb-3 block">
          Price Range (₹/month)
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100000}
          min={5000}
          step={1000}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <Label className="text-foreground font-medium mb-3 block">
          Property Type
        </Label>
        <div className="space-y-3">
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={(checked) => 
                  handleTypeChange(type, checked as boolean)
                }
              />
              <Label
                htmlFor={type}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy Preference */}
      <div className="mb-6">
        <Label className="text-foreground font-medium mb-3 block">
          Occupancy Preference
        </Label>
        <div className="space-y-3">
          {occupancyTypes.map((occupancy) => (
            <div key={occupancy} className="flex items-center space-x-2">
              <Checkbox
                id={occupancy}
                checked={selectedOccupancy.includes(occupancy)}
                onCheckedChange={(checked) => 
                  handleOccupancyChange(occupancy, checked as boolean)
                }
              />
              <Label
                htmlFor={occupancy}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {occupancy}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Filters */}
      {(selectedTypes.length > 0 || selectedOccupancy.length > 0) && (
        <div className="mb-6">
          <Label className="text-foreground font-medium mb-3 block">
            Selected Filters
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {type}
              </Badge>
            ))}
            {selectedOccupancy.map((occupancy) => (
              <Badge key={occupancy} variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {occupancy}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear All */}
      <Button 
        variant="outline" 
        onClick={clearAllFilters}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </Card>
  );
};

export default SearchFilters;