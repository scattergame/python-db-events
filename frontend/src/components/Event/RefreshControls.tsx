'use client';

import { Button, Box, HStack, VStack, Text, NativeSelect } from "@chakra-ui/react";
import { LuRefreshCw } from 'react-icons/lu';
import { Sites } from '@/types/site';

interface RefreshControlsProps {
  selectedSiteToRefresh: string;
  setSelectedSiteToRefresh: (value: string) => void;
  isRefreshing: boolean | string;
  refreshedSites: string[];
  onRefresh: () => void;
}

export default function RefreshControls({
  selectedSiteToRefresh,
  setSelectedSiteToRefresh,
  isRefreshing,
  refreshedSites,
  onRefresh
}: RefreshControlsProps) {
  return (
    <Box>
      <HStack justifyContent="space-between" alignItems="flex-start">
        {/* Refresh Control */}
        <HStack gap={4}>
          <NativeSelect.Root size="sm" width="auto">
            <NativeSelect.Field
              value={selectedSiteToRefresh}
              onChange={(e) => setSelectedSiteToRefresh(e.target.value)}
            >
              <option value="all">All Sites</option>
              {Sites.map(site => (
                <option key={site} value={site}>{site}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <Button
            colorScheme="blue"
            onClick={onRefresh}
            disabled={isRefreshing !== false}
            loading={isRefreshing !== false}
            loadingText={typeof isRefreshing === 'string' ? `Refreshing ${isRefreshing}` : 'Refreshing'}
          >
            <LuRefreshCw />
            {isRefreshing ? `Refreshing ${isRefreshing}` : 'Refresh'}
          </Button>
        </HStack>

        {/* Refreshed Sites Summary */}
        <Box
          maxHeight="100px"
          minWidth="250px"
          overflowY="auto"
          p={2}
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          fontSize="sm"
          color="gray.700"
          background="gray.50"
        >
          {refreshedSites.length > 0 ? (
            <VStack align="start" gap={1}>
              {refreshedSites.map(site => (
                <Box key={site}>✅ {site}</Box>
              ))}
            </VStack>
          ) : (
            <Text>No sites refreshed yet</Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
}