import { useState, useEffect, useRef } from 'react';

export function useWebSocket() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const pongTimeoutRef = useRef(null);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connect = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem('auth-token');
      if (!token) {
        // console.warn('No authentication token found for WebSocket connection');
        return;
      }

      // Fetch server configuration to get the correct WebSocket URL
      let wsBaseUrl;
      try {
        const configResponse = await fetch('/api/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const config = await configResponse.json();
        wsBaseUrl = config.wsUrl;

        // If the config returns localhost but we're not on localhost, use current host but with API server port
        if (wsBaseUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
          // console.warn('Config returned localhost, using current host with API server port instead');
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          // For development, API server is typically on port 4008 when Vite is on 4009
          const apiPort = window.location.port === '4009' ? '4008' : window.location.port;
          wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
        }
      } catch {
        // console.warn('Could not fetch server config, falling back to current host with API server port');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // For development, API server is typically on port 4008 when Vite is on 4009
        const apiPort = window.location.port === '4009' ? '4008' : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }

      // Include token in WebSocket URL as query parameter
      const wsUrl = `${wsBaseUrl}/ws?token=${encodeURIComponent(token)}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
        setWs(websocket);
        reconnectAttemptsRef.current = 0;

        heartbeatIntervalRef.current = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: 'ping' }));
            pongTimeoutRef.current = setTimeout(() => {
              try { websocket.close(); } catch { /* ignore */ }
            }, 10000);
          }
        }, 30000);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') {
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
            }
            return;
          }
          setMessages(prev => [...prev, data]);
        } catch {
          // console.error('Error parsing WebSocket message');
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        if (pongTimeoutRef.current) {
          clearTimeout(pongTimeoutRef.current);
        }

        const attempt = reconnectAttemptsRef.current;
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(30000, 1000 * Math.pow(2, attempt));
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      websocket.onerror = () => {
        // console.error('WebSocket error');
      };

    } catch {
      // console.error('Error creating WebSocket connection');
    }
  };

  const sendMessage = (message) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    } else {
      // console.warn('WebSocket not connected');
    }
  };

  return {
    ws,
    sendMessage,
    messages,
    isConnected
  };
}