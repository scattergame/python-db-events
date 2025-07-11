'use client';

import { useRef, useState, useCallback } from 'react';
import EventEditTable, { TableHeader, EventTableRef } from "@/components/Event/EventEditTable";
import { Button, Container, Box, Heading, VStack, HStack, CloseButton } from "@chakra-ui/react";
import { LuCirclePlus } from 'react-icons/lu';
import { Separator, Dialog, Portal } from '@chakra-ui/react';
import EventCard from '@/components/Event/EventCard';
import InputWithKbd from '@/components/InputWithKbd';
import { Event } from '@/types/event';
import { EventTimeFilterType, ValidityFilterType } from '@/types/filters';
import NewEventCard from '@/components/Event/NewEventCard';
import EventFilters from '@/components/Event/EventFilters';
import RefreshControls from '@/components/Event/RefreshControls';
import { useEventRefresh } from '@/hooks/useEventRefresh';
import { handleExportExcel } from '@/utils/exportExcel';

export default function DashboardPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const eventTableRef = useRef<EventTableRef>(null);
  
  // Filter states
  const [sortBy, setSortBy] = useState('start_datetime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeFilterType>('all-events');
  const [validityFilter, setValidityFilter] = useState<ValidityFilterType>('valid');

  // Refresh hook
  const {
    isRefreshing,
    refreshedSites,
    selectedSiteToRefresh,
    setSelectedSiteToRefresh,
    handleRefresh
  } = useEventRefresh();

  const handleSearch = (term: string) => {
    eventTableRef.current?.setSearchTerm(term);
  };

  const handleEventUpdate = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleEventAdd = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleEventDelete = useCallback(() => {
    setSelectedEvent(null);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleFilterChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSelectEvent = (event: Event | null) => {
    setSelectedEvent(event);
    setSelectedEventId(event?.id || null);
  };

  const onRefreshComplete = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <Container maxW="100%" py={8} px={4}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Events Dashboard</Heading>
        <RefreshControls
          selectedSiteToRefresh={selectedSiteToRefresh}
          setSelectedSiteToRefresh={setSelectedSiteToRefresh}
          isRefreshing={isRefreshing}
          refreshedSites={refreshedSites}
          onRefresh={() => handleRefresh(onRefreshComplete)}
        />
      </HStack>

      <VStack gapY={6} align="stretch">
        <Box borderWidth="2px" borderRadius="md" p={4} w="full" minWidth="1400px">
          <Heading size="md" mb={4}>Events List</Heading>

          <HStack mb={4}>
            <InputWithKbd onSearch={handleSearch} />
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button colorScheme="gray" mr={3}><LuCirclePlus /> New Event</Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content maxWidth="500px">
                    <Dialog.Header>
                      <Dialog.Title>Add New Event</Dialog.Title>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                      </Dialog.CloseTrigger>
                    </Dialog.Header>
                    <Dialog.Body p={3}>
                      <NewEventCard onEventAdd={handleEventAdd} />
                    </Dialog.Body>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </HStack>

          <EventFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedMarket={selectedMarket}
            setSelectedMarket={setSelectedMarket}
            selectedIndustry={selectedIndustry}
            setSelectedIndustry={setSelectedIndustry}
            selectedOrganizer={selectedOrganizer}
            setSelectedOrganizer={setSelectedOrganizer}
            eventTimeFilter={eventTimeFilter}
            setEventTimeFilter={setEventTimeFilter}
            validityFilter={validityFilter}
            setValidityFilter={setValidityFilter}
            onFilterChange={handleFilterChange}
            onExportExcel={() => handleExportExcel(eventTableRef)}
          />

          <Separator my={2} mx={4} />

          <Box borderWidth="2px" borderRadius="md" w="full" minWidth="1400px">
            <Box overflowX="auto" minWidth="1400px">
              <TableHeader />
            </Box>
            <Box maxH={600} overflowY="auto" minWidth="1400px">
              <EventEditTable
                ref={eventTableRef}
                onSelectEvent={handleSelectEvent}
                refreshTrigger={refreshTrigger}
                showHeader={false}
                selectedEventId={selectedEventId}
                sortBy={sortBy}
                sortOrder={sortOrder}
                selectedMarket={selectedMarket}
                selectedIndustry={selectedIndustry}
                selectedOrganizer={selectedOrganizer}
                eventTimeFilter={eventTimeFilter}
                validityFilter={validityFilter}
              />
            </Box>
          </Box>
        </Box>

        <Box borderWidth="2px" borderRadius="md" p={4} w="full">
          <Heading size="md" mb={3}>Selected Event</Heading>
          {selectedEvent ? (
            <EventCard
              event={selectedEvent}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
            />
          ) : (
            <p>Select an event to view details.</p>
          )}
        </Box>
      </VStack>
    </Container>
  );
}