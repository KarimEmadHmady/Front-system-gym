  export const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  export const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return messageDate.toLocaleDateString('ar-EG');
    }
  };

  export const isMyMessage = (message: any, currentUser: any) => {
    return message.fromUserId === currentUser?.id;
  };

  export const getMessageStatus = (message: any, currentUser: any) => {
    if (isMyMessage(message, currentUser)) {
      return {
        read: message.read,
        color: message.read ? '#22c55e' : '#9ca3af'
      };
    }
    return null;
  };

  export const getUnreadCount = (memberId: string, messages: any[], currentUser: any) => {
    return messages.filter(m => 
      m.fromUserId === memberId && 
      m.userId === currentUser?.id && 
      !m.read
    ).length;
  };
