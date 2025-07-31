import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { jobService } from '../services/jobService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Card } from 'flowbite-react';
import toast from 'react-hot-toast';

// Helper to transform job data into calendar event format
function jobToEvent(job) {
  return {
    id: job.id,
    title: `${job.customerName || 'Unnamed Customer'} - ${job.serviceName || 'Service'}`,
    start: job.scheduledAt,
    backgroundColor: job.crewId ? '#3b82f6' : '#6b7280', // Blue if assigned, gray if not
    extendedProps: {
      crewName: job.crewName,
      status: job.status,
      address: job.address
    }
  };
}

// Custom event render function
function renderEventContent(eventInfo) {
  const { crewName } = eventInfo.event.extendedProps;
  
  return (
    <div className="p-1 overflow-hidden">
      <div className="text-sm font-medium truncate">
        {eventInfo.event.title}
      </div>
      {crewName && (
        <div className="text-xs opacity-75 truncate">
          Team: {crewName}
        </div>
      )}
    </div>
  );
}

export default function ScheduleCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [user?.companyId]);

  async function loadJobs() {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const jobs = await jobService.fetchJobs(user.companyId);
      setEvents(jobs.map(jobToEvent));
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Could not load schedule');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-1 text-sm text-gray-600">
          View all scheduled jobs and assignments
        </p>
      </div>

      {/* Calendar Card */}
      <Card className="overflow-hidden">
        <div className="p-0"> {/* Remove default Card padding */}
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={events}
            eventContent={renderEventContent}
            height="auto"
            aspectRatio={1.8}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventDidMount={(info) => {
              // Add tooltips
              info.el.title = `
                ${info.event.title}
                ${info.event.extendedProps.crewName ? `\nTeam: ${info.event.extendedProps.crewName}` : ''}
                ${info.event.extendedProps.address ? `\nLocation: ${info.event.extendedProps.address}` : ''}
                ${info.event.extendedProps.status ? `\nStatus: ${info.event.extendedProps.status}` : ''}
              `.trim();
            }}
            dayMaxEvents={true} // Allow "more" link when too many events
            firstDay={1} // Start week on Monday
            slotMinTime="06:00:00" // Start day at 6 AM
            slotMaxTime="22:00:00" // End day at 10 PM
            allDaySlot={false} // Hide "all day" slot in week view
            nowIndicator={true} // Show current time indicator
            eventClick={(info) => {
              // Navigate to job detail
              window.location.href = `/fms/jobs/${info.event.id}`;
            }}
          />
        </div>
      </Card>
    </div>
  );
}