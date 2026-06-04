export interface Activity {
  id: string;
  time: string;
  message: string;
}

export function logActivity(message: string) {
  if (typeof window === "undefined") return;
  
  const storedLogs = localStorage.getItem("sptc-activity-log");
  const logs: Activity[] = storedLogs ? JSON.parse(storedLogs) : [];
  
  // Format current time as e.g. "10:15 AM"
  const currentTime = new Date().toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
  
  const newActivity: Activity = {
    id: `act-${Date.now()}`,
    time: currentTime,
    message
  };
  
  // Keep the latest 50 logs
  const updatedLogs = [newActivity, ...logs].slice(0, 50);
  localStorage.setItem("sptc-activity-log", JSON.stringify(updatedLogs));
}
