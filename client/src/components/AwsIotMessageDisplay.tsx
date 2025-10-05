import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import './AwsIotMessageDisplay.css';

interface AwsIotMessage {
  timestamp: string;
  topic: string;
  messageType: string;
  vehicleId: string;
  data: any;
  source: string;
}

const AwsIotMessageDisplay: React.FC = () => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<AwsIotMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleAwsIotMessage = (message: AwsIotMessage) => {
      console.log('Received AWS IoT Message:', message);
      setMessages((prevMessages) => [message, ...prevMessages].slice(0, 10));
    };

    socket.on('aws-iot-message', handleAwsIotMessage);

    return () => {
      socket.off('aws-iot-message', handleAwsIotMessage);
    };
  }, [socket]);

  return (
    <div className="aws-iot-message-display">
      <h3>AWS IoT Messages</h3>
      <div className="message-list">
        {messages.length === 0 ? (
          <p>No messages received yet.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message-item">
              <p><strong>Topic:</strong> {msg.topic}</p>
              <p><strong>Timestamp:</strong> {new Date(msg.timestamp).toLocaleString()}</p>
              <p><strong>Message:</strong> {
                typeof msg.data === 'object' 
                  ? JSON.stringify(msg.data, null, 2)
                  : msg.data.toString()
              }</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AwsIotMessageDisplay;