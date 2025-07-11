import * as XLSX from 'xlsx';
import { saveAs } from "file-saver"
import { EventTableRef } from '@/components/Event/EventEditTable';

export function handleExportExcel(eventTableRef: React.RefObject<EventTableRef | null>)
 {
  const events = eventTableRef.current?.getData();
  if (!events || events.length === 0) {
    console.warn('No event data to export');
    return;
  }

  const data = events.map(event => ({
    Date: event.start_datetime?.split('T')[0],
    'Start Time': event.start_datetime?.split('T')[1]?.slice(0, 5),
    'End Time': event.end_datetime?.split('T')[1]?.slice(0, 5),
    Title: event.title,
    Organizer: event.organizer,
    Industry: event.industry,
    Market: event.market,
    Attending: event.attending,
    Link: event.event_link,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `Events_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}