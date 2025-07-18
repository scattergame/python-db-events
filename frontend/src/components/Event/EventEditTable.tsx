'use client';

import { useState, useEffect, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { Box, Table, Spinner, Text } from '@chakra-ui/react';
import { Event } from '@/types/event';
import { forwardRef, useImperativeHandle } from 'react';

import {
  useColorModeValue,
} from "@/components/ui/color-mode"

interface EventTableProps {
  onSelectEvent: (event: Event | null) => void;
  refreshTrigger: number;
  showHeader?: boolean;
  selectedEventId?: number | null;
  sortBy: string;
  sortOrder: string;
  selectedMarket?: string;
  selectedIndustry?: string;
  selectedOrganizer?: string;
  eventTimeFilter?: 'all-events' | 'past-events' | 'upcoming-events';
  validityFilter?: 'all' | 'valid' | 'invalid';
}

export interface EventTableRef {
  setSearchTerm: (term: string) => void;
  getData: () => Event[];
}

const columnWidths = {
  weekday: '6%',
  startDateTime: '12%',
  endDateTime: '12%',
  organizer: '8%',
  title: '35%',
  event_link: '7%',
  industry: '10%',
  market: '5%',
  attending: '5%'
};

export const TableHeader = () => (
  <Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.weekday} textAlign="left">Weekday</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.startDateTime} textAlign="left">Start Date/Time</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.endDateTime} textAlign="left">End Date/Time</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.organizer} textAlign="left">Organizer</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.title} textAlign="left">Title</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.event_link} textAlign="left">Link</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.industry} textAlign="left">Industry</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.market} textAlign="left">Market</Table.ColumnHeader>
      <Table.ColumnHeader fontWeight="bold" width={columnWidths.attending} textAlign="left">Attending</Table.ColumnHeader>
    </Table.Row>
    </Table.Header>
  </Table.Root>
);

const TableBody = ({ 
  events, 
  onSelectEvent, 
  rowHoverColor, 
  selectedEventId, 
  selectedRowColor,
  latestCreatedAt
}: {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  rowHoverColor: string,
  selectedEventId: number | null;
  selectedRowColor: string;
  latestCreatedAt: Date | null;
}) => {
  const now = new Date();

  const addTransparency = (color: string, alpha: number): string => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  const getRowColor = (event: Event): string => {
    const alpha = 0.66;

    if (event.id === selectedEventId) return addTransparency(selectedRowColor, alpha);
    
    if (event.color) return addTransparency(event.color, alpha); // Use the event's original color if it exists
    
    return 'transparent'; // Default to transparent if no color is set
  };

  const isPastEvent = (event: Event): boolean => {
    const eventEndDate = new Date(event.end_datetime);
    return eventEndDate < now;
  };

  const isNewlyAdded = (event: Event): boolean => {
    if (!latestCreatedAt) return false;
    
    const eventCreatedAt = new Date(event.created_at);
    const thirtyMinutesAgo = new Date(latestCreatedAt.getTime() - 30 * 60000);
    return eventCreatedAt >= thirtyMinutesAgo && eventCreatedAt <= latestCreatedAt;
  };

  return (
    <Table.Body>
      {events.map((event) => (
        <Table.Row
          key={event.id}
          onClick={() => onSelectEvent(event)}
          cursor="pointer"
          _hover={{ bg: rowHoverColor }}
          fontWeight={event.id === selectedEventId ? "bold" : "normal"}
          style={{ backgroundColor: getRowColor(event) }} // << use inline style to avoid Chakra overrides
        >
          <Table.Cell width={columnWidths.weekday} textAlign="left">
            {new Date(event.start_datetime).toLocaleDateString('en-US', { weekday: 'long' })}
          </Table.Cell>
          <Table.Cell width={columnWidths.startDateTime} textAlign="left">
            {new Date(event.start_datetime).toLocaleString()}
          </Table.Cell>
          <Table.Cell width={columnWidths.endDateTime} textAlign="left">
            {new Date(event.end_datetime).toLocaleString()}
          </Table.Cell>
          <Table.Cell width={columnWidths.organizer} textAlign="left">{event.organizer}</Table.Cell>
          <Table.Cell width={columnWidths.title} textAlign="left">
            {event.title}
            {isPastEvent(event) && <Text as="span" ml={2} fontWeight="bold" color="gray.500">[Passed]</Text>}
            {isNewlyAdded(event) && <Text as="span" ml={2} fontWeight="bold" color="orange.500">[New]</Text>}
          </Table.Cell>
          <Table.Cell width={columnWidths.event_link} textAlign="left">
              <a href={encodeURI(event.event_link)} target="_blank" rel="noopener noreferrer">
                Link
              </a>
          </Table.Cell>
          <Table.Cell width={columnWidths.industry} textAlign="left">{event.industry}</Table.Cell>
          <Table.Cell width={columnWidths.market} textAlign="left">{event.market}</Table.Cell>
          <Table.Cell width={columnWidths.attending} textAlign="left">{event.attending}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  );
};

const EventEditTable = forwardRef<EventTableRef, EventTableProps>(({
  onSelectEvent,
  refreshTrigger,
  showHeader = true,
  selectedEventId: propSelectedEventId,
  sortBy,
  sortOrder,
  selectedMarket,
  selectedIndustry,
  selectedOrganizer,
  eventTimeFilter,
  validityFilter,
}, ref) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [selectedEventId, setSelectedEventId] = useState<number | null>(propSelectedEventId || null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filter, setFilter] = useState('all');
  const [latestCreatedAt, setLatestCreatedAt] = useState<Date | null>(null);

  const rowHoverColor = useColorModeValue('gray.100', 'gray.700');
  const selectedRowColor = useColorModeValue('blue.100', 'blue.700');

  // We'll create a stable reference to the onSelectEvent function
  const onSelectEventRef = useRef(onSelectEvent);
  
  // Update the ref when onSelectEvent changes
  useEffect(() => {
    onSelectEventRef.current = onSelectEvent;
  }, [onSelectEvent]);

  // Define handleSelectEvent with the ref instead of the direct prop
  const handleSelectEvent = useCallback((event: Event | null) => {
    // Only call onSelectEvent if the selected event has actually changed
    if (event?.id !== propSelectedEventId || (event === null && propSelectedEventId !== null)) {
      onSelectEventRef.current(event);
    }
  }, [propSelectedEventId]); // Now depends on propSelectedEventId to check for changes

  // Expose method to parent
  useImperativeHandle(ref, () => ({
    setSearchTerm: (term: string) => {
      setSearch(term);
    },
    getData: () => {
      return events;
    }
  }));

  // Debounce input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200); // 200ms debounce

    return () => clearTimeout(timeout);
  }, [search]);

  // useEffect(() => {
  //   if (propSelectedEventId !== undefined) {
  //     setSelectedEventId(propSelectedEventId);
  //   }
  // }, [propSelectedEventId]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          sort_by: sortBy,
          sort_order: sortOrder,
          filter: filter,
        });

        // Handle validity filter
        if (validityFilter === 'valid') {
          params.set('valid', 'true');
        } else if (validityFilter === 'invalid') {
          params.set('valid', 'false');
        }
        // If validityFilter is 'all', don't set the valid parameter

        if (selectedMarket && selectedMarket !== 'all') {
          params.set('market', selectedMarket);
        }
        if (selectedIndustry && selectedIndustry !== 'all') {
          params.set('industry', selectedIndustry);
        }
        if (selectedOrganizer && selectedOrganizer !== 'all') {
          params.set('organizer', selectedOrganizer);
        }

        if (eventTimeFilter === 'upcoming-events') {
          params.set('start_after', new Date().toISOString());
        } else if (eventTimeFilter === 'past-events') {
          params.set('start_before', new Date().toISOString());
        }

        const res = await fetch(`/api/events?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);

        if (data.length > 0) {
          const latestEvent = data.reduce((latest: Event, current: Event) =>
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
          );
          setLatestCreatedAt(new Date(latestEvent.created_at));

          const currentSelectedEvent = data.find((event: Event) => event.id === propSelectedEventId);

          // Only call handleSelectEvent if necessary
          if (!currentSelectedEvent && data[0]?.id !== propSelectedEventId) {
            // If no selected event is found in the data and the first event is different from the current selection
            handleSelectEvent(data[0]);
          } else if (currentSelectedEvent && currentSelectedEvent.id !== propSelectedEventId) {
            // If a selected event is found but it's different from the current selection
            handleSelectEvent(currentSelectedEvent);
          }
          // If the current selection is already correct, do nothing
        } else if (propSelectedEventId !== null) {
          // Only call handleSelectEvent if we're currently showing an event but there are no events
          handleSelectEvent(null);
        }
      } catch (err) {
        setError('Error loading events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [
    refreshTrigger, 
    debouncedSearch, 
    sortBy, 
    sortOrder, 
    filter, 
    selectedMarket, 
    selectedIndustry, 
    selectedOrganizer, 
    eventTimeFilter,
    validityFilter
    // handleSelectEvent removed from dependencies
  ]);

  return (
    <Box>
      {error && <Text color="red">{error}</Text>}
      {loading && <Spinner />}

      <Table.Root size="sm" width="100%" fontSize="xs">
        {!loading && !error && (
          <TableBody
            events={events}
            onSelectEvent={handleSelectEvent}
            rowHoverColor={rowHoverColor}
            selectedEventId={propSelectedEventId ?? null}
            selectedRowColor={selectedRowColor}
            latestCreatedAt={latestCreatedAt}
          />
        )}
      </Table.Root>
    </Box>
  );
});

EventEditTable.displayName = 'EventEditTable';

export default EventEditTable;