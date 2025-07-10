import { useState } from 'react';
import { Sites } from '@/types/site';
import { toaster } from '@/components/ui/toaster';

export function useEventRefresh() {
  const [isRefreshing, setIsRefreshing] = useState<boolean | string>(false);
  const [refreshedSites, setRefreshedSites] = useState<string[]>([]);
  const [selectedSiteToRefresh, setSelectedSiteToRefresh] = useState('all');

  const handleRefresh = async (onRefreshComplete: () => void) => {
    setIsRefreshing(true);
    setRefreshedSites([]);

    const sitesToRefresh = selectedSiteToRefresh === 'all' ? Sites : [selectedSiteToRefresh];

    for (let i = 0; i < sitesToRefresh.length; i++) {
      const site = sitesToRefresh[i];
      setIsRefreshing(site);

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ websites: [site] }),
        });

        if (!res.ok) {
          const err = await res.json();
          toaster.create({ 
            title: `Failed on ${site}`, 
            description: err.detail || 'Unexpected server error', 
            type: 'error' 
          });
          break;
        }

        onRefreshComplete();
        setRefreshedSites(prev => [...prev, site]);
      } catch (error) {
        toaster.create({ 
          title: `Network error on ${site}`, 
          description: error instanceof Error ? error.message : "Unknown error", 
          type: 'error' 
        });
        break;
      }
    }

    setIsRefreshing(false);
  };

  return {
    isRefreshing,
    refreshedSites,
    selectedSiteToRefresh,
    setSelectedSiteToRefresh,
    handleRefresh
  };
}