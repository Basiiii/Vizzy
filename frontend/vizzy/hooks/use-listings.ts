import { useState, useEffect } from 'react';
import { fetchHomeListings } from '@/lib/api/listings/fetch-user-listings';
import { fetchUserLocation } from '@/lib/api/user/location';
import type { ListingBasic } from '@/types/listing';

export type LocationParams = {
  lat: number;
  lon: number;
  dist: number;
};

export function useListings() {
  const [listings, setListings] = useState<ListingBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listingType, setListingType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
    address: string;
  } | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [locationDistance, setLocationDistance] = useState<string>('5000'); // Default 5km
  const limit = 12;

  // Fetch user location on component mount
  useEffect(() => {
    async function getUserLocation() {
      const result = await fetchUserLocation();
      if (result.data) {
        setUserLocation({
          lat: result.data.lat,
          lon: result.data.lon,
          address: result.data.full_address,
        });
      }
    }

    getUserLocation();
  }, []);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);

        // Prepare location parameters if user has enabled location filtering
        const locationParams =
          useLocation && userLocation
            ? {
                lat: userLocation.lat,
                lon: userLocation.lon,
                dist: parseInt(locationDistance, 10),
              }
            : undefined;

        const response = await fetchHomeListings(
          page,
          limit,
          listingType,
          searchTerm,
          locationParams,
        );

        setListings(response.listings);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [
    page,
    listingType,
    searchTerm,
    useLocation,
    locationDistance,
    userLocation,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleTypeChange = (value: string) => {
    setListingType(value);
    setPage(1); // Reset to first page on filter change
  };

  const handleLocationToggle = (checked: boolean) => {
    setUseLocation(checked);
    setPage(1); // Reset to first page when toggling location filter
  };

  const handleDistanceChange = (value: string) => {
    setLocationDistance(value);
    setPage(1); // Reset to first page when changing distance
  };

  return {
    listings,
    loading,
    page,
    totalPages,
    listingType,
    searchTerm,
    searchInput,
    setSearchInput,
    userLocation,
    useLocation,
    locationDistance,
    handlePageChange,
    handleSearch,
    handleTypeChange,
    handleLocationToggle,
    handleDistanceChange,
  };
}
