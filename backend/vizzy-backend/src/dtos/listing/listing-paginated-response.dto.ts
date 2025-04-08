import { ListingBasic } from './listing-basic.dto';

export interface ListingPaginatedResponse {
  listings: ListingBasic[];
  totalPages: number;
  currentPage: number;
}
