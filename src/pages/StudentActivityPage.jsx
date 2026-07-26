import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { ArrowLeft, Activity, MapPin, Clock } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

const StudentActivityPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { rfidLogs, loading, errors } = useDashboardData();

  const myActivity = useMemo(() => {
    if (!userProfile?.studentId || !rfidLogs) return [];
    
    // Filter logs for the current student
    const logs = rfidLogs.filter(log => log.studentId === userProfile.studentId);
    
    // Sort descending by timestamp (newest first) just in case
    return logs.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });
  }, [rfidLogs, userProfile]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <button 
            onClick={() => navigate('/student')} 
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cyan-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-800">My Activity</h1>
              <p className="mt-1 text-sm text-slate-500">View your library entries and seat interactions</p>
            </div>
          </div>
        </div>

        {/* Activity List Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading.rfidLogs ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-slate-500">Loading your activity...</p>
            </div>
          ) : errors.rfidLogs ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-rose-500">{errors.rfidLogs}</p>
            </div>
          ) : myActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-700">No recent activity</p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">It looks like you haven't tapped your RFID card at the library recently.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 py-2">
              <div className="space-y-8">
                {myActivity.map((log) => {
                  const isEntrance = log.readerLocation?.toLowerCase().includes('entrance') || log.readerLocation?.trim() === '';
                  const locationText = isEntrance ? 'Library Entrance' : `Seat ${log.readerLocation}`;
                  
                  return (
                    <div key={log.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white ${isEntrance ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
                      
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition hover:bg-slate-50">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 ${isEntrance ? 'text-emerald-500' : 'text-cyan-500'}`} />
                            <span className="font-semibold text-slate-800">{locationText}</span>
                            {isEntrance && (
                              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                Entry
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-sm text-slate-600">
                          {isEntrance 
                            ? 'You tapped your card at the library entrance.' 
                            : `You tapped your card at seat ${log.readerLocation}.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default StudentActivityPage;
