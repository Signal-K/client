import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu';
import Link from 'next/link';
import { formatDistanceToNow, startOfDay, addDays, subDays } from 'date-fns';
import Cookies from 'js-cookie';
import { useAuthUser } from '@/src/hooks/useAuthUser';

interface LinkedAnomaly {
  id: string;
  anomaly: {
    id: number;
    anomalytype: string;
    content: string;
    classification_status: string;
  };
  date: string; // updated from created_at to date
}

interface UpcomingEvent {
  id: number;
  type: string;
  time: string;
  location: {
    id: number;
    content: string;
  };
  classification_location: {
    id: number;
  };
}

interface AlertItem {
  id: string;
  type: 'anomaly' | 'event' | 'completion';
  message: string;
  anomalyId?: number;
  eventId?: number;
  classificationId?: number;
  anomaly?: {
    anomalytype?: string; // added to easily access anomalytype
  };
}

const getCookieKey = (userId: string, week: string) => `dismissed-alerts-${userId}-${week}`;

const playRandomSound = () => {
  const soundFiles = [
    "/assets/audio/notifs/r2d2.wav",
    "/assets/audio/notifs/r2d21.wav",
  ];
  const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
  const audio = new Audio(randomSound);
  audio.play().catch((err) => console.error("Failed to play sound:", err));
};

async function generateAlerts(userId: string | null | undefined): Promise<AlertItem[]> {
  if (!userId) return [];

  try {
    const response = await fetch("/api/gameplay/alerts", { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return [];
    }
    const fetchedAlerts: AlertItem[] = payload?.alerts || [];

    const currentWeek = new Date().toISOString().split('T')[0];
    const cookieKey = getCookieKey(userId, currentWeek);
    const dismissedIds = JSON.parse(Cookies.get(cookieKey) || "[]");
    const visibleAlerts = fetchedAlerts.filter((alert) => !dismissedIds.includes(alert.id));

    if (visibleAlerts.length === 0) {
      return [{
        id: 'completion',
        type: 'completion',
        message: "No primary objects left to classify. Great work!"
      }];
    }

    return visibleAlerts;
  } catch (error) {
    console.error('Error generating alerts:', error);
    return [{
      id: 'error',
      type: 'completion',
      message: "Unable to load alerts at this time."
    }];
  }
}

export default function ResponsiveAlerts() {
  const { user } = useAuthUser();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      const alertItems = await generateAlerts(user?.id);
      setAlerts(alertItems);
      setHasNewAlert(alertItems.length > 0 && alertItems[0].type !== 'completion');
      setNewNotificationsCount(alertItems.filter(a => a.type !== 'completion').length);
    };

    fetchAlerts();
  }, [user?.id]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const melbourneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" }));
      const nextMidnight = startOfDay(addDays(melbourneTime, 1));
      setTimeRemaining(formatDistanceToNow(nextMidnight, { addSuffix: true }));
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  const dismissCurrentAlert = () => {
    if (!user || alerts.length === 0) return;

    const currentAlert = alerts[currentAlertIndex];
    if (currentAlert.type === 'completion') return;

    const currentWeek = new Date().toISOString().split('T')[0];
    const cookieKey = getCookieKey(user.id, currentWeek);
    const dismissedIds: string[] = JSON.parse(Cookies.get(cookieKey) || "[]");
    const updated = [...new Set([...dismissedIds, currentAlert.id])];
    Cookies.set(cookieKey, JSON.stringify(updated), { expires: 7 });

    playRandomSound();

    const nextIndex = currentAlertIndex + 1;
    if (nextIndex < alerts.length) {
      setCurrentAlertIndex(nextIndex);
      setNewNotificationsCount(Math.max(0, newNotificationsCount - 1));
    } else {
      generateAlerts(user.id).then(alertItems => {
        setAlerts(alertItems);
        setCurrentAlertIndex(0);
        setHasNewAlert(false);
        setNewNotificationsCount(0);
      });
    }
  };

  const goToPrevious = () => {
    if (currentAlertIndex > 0) {
      setCurrentAlertIndex(currentAlertIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentAlertIndex < alerts.length - 1) {
      setCurrentAlertIndex(currentAlertIndex + 1);
    }
  };

  const currentAlert = alerts[currentAlertIndex];

  const getActionPath = () => {
    if (!currentAlert) return null;

    if (currentAlert.type === 'anomaly' && currentAlert.anomalyId) {
      const type = currentAlert.anomaly?.anomalytype || '';

      if (
        type === 'automatonSatellitePhoto' ||
        type === 'satellitePics' ||
        type === 'gaseousMapping' ||
        type === 'cloud'
      ) {
        return '/structures/balloon';
      } else if (type === 'zoodexOthers') {
        return '/structures/greenhouse';
      } else {
        return '/structures/telescope';
      }
    }

    if (currentAlert.type === 'event' && currentAlert.classificationId) {
      return `/classification/${currentAlert.classificationId}`;
    }

    return null;
  };

  const actionPath = getActionPath();

  const AlertContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7] md:from-[#81A1C1] md:to-[#B48EAD]">
          Notifications
        </h2>
        {alerts.length > 1 && (
          <span className="text-xs text-gray-500 md:text-[#A3BE8C]">
            {currentAlertIndex + 1} of {alerts.length}
          </span>
        )}
      </div>
      
      <div className="text-center font-semibold">
        <p className="text-[#67e8f9] md:text-[#D8DEE9] mb-2">
          {currentAlert?.message || "No new alerts."}
        </p>
        <p className="text-xs text-gray-500 md:text-[#A3BE8C]">
          Time remaining until next event: {timeRemaining}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {actionPath && (
          <div className="flex justify-center">
            <Link href={actionPath}>
              <Button 
                variant="default" 
                className="md:bg-[#88C0D0] md:hover:bg-[#81A1C1] md:text-[#2E3440]"
              >
                {currentAlert?.type === 'anomaly' ? 'Classify Object' : 'View Event'}
              </Button>
            </Link>
          </div>
        )}

        {alerts.length > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentAlertIndex === 0}
              className="md:bg-[#4C566A] md:hover:bg-[#5E81AC] md:text-[#ECEFF4] md:border-[#5E81AC]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentAlertIndex === alerts.length - 1}
              className="md:bg-[#4C566A] md:hover:bg-[#5E81AC] md:text-[#ECEFF4] md:border-[#5E81AC]"
            >
              Next
            </Button>
          </div>
        )}

        {/* {currentAlert?.type !== 'completion' && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="md:bg-[#5E81AC] md:hover:bg-[#4C566A] md:text-[#ECEFF4]"
              onClick={dismissCurrentAlert}
            >
              Dismiss
            </Button>
          </div>
        )} */}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="block md:hidden w-full max-w-[400px] bg-gradient-to-b from-[#0f172a] to-[#020617] backdrop-blur-md border border-[#581c87] shadow-[0_0_15px_rgba(124,58,237,0.5)]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center relative">
            <Bell className="h-5 w-5 text-blue-400" />
            <span className="ml-2 text-white">Alerts</span>
            {hasNewAlert && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs">
                {newNotificationsCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="p-4">
          <AlertContent />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative group flex items-center h-8">
              <Bell className="h-4 w-4 text-[#81A1C1] group-hover:text-[#88C0D0] transition-colors flex-shrink-0" />
              <span className="ml-1 text-[#ECEFF4] text-sm whitespace-nowrap">Alerts</span>
              {hasNewAlert && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-500 text-white h-4 w-4 flex items-center justify-center p-0 text-xs">
                  {newNotificationsCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-y-auto bg-[#2E3440] border border-[#5E81AC] shadow-md rounded-md p-4">
            <AlertContent />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
