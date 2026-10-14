import { useEffect, useRef, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface PoseAnalysisResult {
  pose_detected: boolean;
  rep_count: number;
  good_rep_count: number;
  angle: number;
  state: string;
  status: 'GOOD_REP' | 'BAD_FORM' | null;
  feedback: string;
  keypoints: Record<string, { x: number; y: number }>;
}

export function usePoseWebSocket(exerciseType: string = 'squat') {
  const [isConnected, setIsConnected] = useState(false);
  const [lastResult, setLastResult] = useState<PoseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const isSendingRef = useRef(false);

  // Default WS URL: change via EXPO_PUBLIC_POSE_WS_URL in .env if testing on physical phone
  const wsBase = process.env.EXPO_PUBLIC_POSE_WS_URL || 'ws://localhost:8001/ws/pose-stream';
  const url = `${wsBase}/${exerciseType}`;

  useEffect(() => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        isSendingRef.current = false; // ready for next frame
        try {
          const data: PoseAnalysisResult = JSON.parse(event.data);
          setLastResult(data);

          if (data.status === 'GOOD_REP') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          } else if (data.status === 'BAD_FORM') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          }
        } catch (e) {
          console.warn('Failed to parse WS message', e);
        }
      };

      ws.onerror = (e: any) => {
        setError('Không thể kết nối tới máy chủ AI.');
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setError((e as Error).message);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [url]);

  const sendFrame = useCallback((frameBase64: string) => {
    // Drop frame if previous is still in-flight to prevent network backpressure
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    if (isSendingRef.current) return;

    isSendingRef.current = true;
    socketRef.current.send(JSON.stringify({ frame: frameBase64 }));
  }, []);

  return {
    isConnected,
    lastResult,
    error,
    sendFrame,
  };
}
