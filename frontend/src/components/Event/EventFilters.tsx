'use client';

import { Button, Box, Text, HStack, NativeSelect } from "@chakra-ui/react";
import { Sites } from '@/types/site';
import { Market } from '@/types/market';
import { Industry } from '@/types/industry';
import { Organizer } from '@/types/organizer';

type EventTimeFilterType = "all-events" | "upcoming-events" | "past-events";

interface EventFiltersProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  selectedMarket: string;
  setSelectedMarket: (value: string) => void;
  selectedIndustry: string;
  setSelectedIndustry: (value: string) => void;
  selectedOrganizer: string;
  setSelectedOrganizer: (value: string) => void;
  eventTimeFilter: EventTimeFilterType;
  setEventTimeFilter: (value: EventTimeFilterType) => void;
  validityFilter: 'all' | 'valid' | 'invalid';
  setValidityFilter: (value: 'all' | 'valid' | 'invalid') => void;
  onFilterChange: () => void;
  onExportExcel: () => void;
}

export default function EventFilters({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedMarket,
  setSelectedMarket,
  selectedIndustry,
  setSelectedIndustry,
  selectedOrganizer,
  setSelectedOrganizer,
  eventTimeFilter,
  setEventTimeFilter,
  validityFilter,
  setValidityFilter,
  onFilterChange,
  onExportExcel
}: EventFiltersProps) {
  return (
    <HStack gap={4} align="flex-end" mb={4}>
      <Box>
        <Text fontSize="sm" mb={1}>Sort by</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={sortBy} 
            onChange={(e) => {
              setSortBy(e.target.value);
              onFilterChange();
            }}
          >
            <option value="start_datetime">Start Date/Time</option>
            <option value="end_datetime">End Date/Time</option>
            <option value="created_at">Created Date/Time</option>
            <option value="organizer">Organizer</option>
            <option value="title">Title</option>
            <option value="industry">Industry</option>
            <option value="market">Market</option>
            <option value="attending">Attending</option>
            <option value="color">Color</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Order</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={sortOrder} 
            onChange={(e) => {
              setSortOrder(e.target.value);
              onFilterChange();
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Market</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={selectedMarket} 
            onChange={(e) => {
              setSelectedMarket(e.target.value);
              onFilterChange();
            }}
          >
            <option value="all">All Markets</option>
            {Market.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Industry</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={selectedIndustry} 
            onChange={(e) => {
              setSelectedIndustry(e.target.value);
              onFilterChange();
            }}
          >
            <option value="all">All Industries</option>
            {Industry.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Organizer</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={selectedOrganizer} 
            onChange={(e) => {
              setSelectedOrganizer(e.target.value);
              onFilterChange();
            }}
          >
            <option value="all">All Organizers</option>
            {Organizer.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Event Time</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={eventTimeFilter} 
            onChange={(e) => setEventTimeFilter(e.target.value as EventTimeFilterType)}
          >
            <option value="all-events">All Events</option>
            <option value="upcoming-events">Upcoming Events</option>
            <option value="past-events">Past Events</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Validity</Text>
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field 
            value={validityFilter} 
            onChange={(e) => setValidityFilter(e.target.value as 'all' | 'valid' | 'invalid')}
          >
            <option value="all">All Events</option>
            <option value="valid">Valid Events</option>
            <option value="invalid">Invalid Events</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1}>Export Excel</Text>
        <Button 
          size="sm" 
          colorScheme="blue"
          onClick={onExportExcel}
        >
          Export
        </Button>
      </Box>
    </HStack>
  );
}