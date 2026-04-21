'use client';

import React from 'react';
import { Users, X } from 'lucide-react';

interface MembersListProps {
  members: any[];
  selectedMember: any;
  showMembersList: boolean;
  onMemberSelect: (member: any) => void;
  onToggleList: () => void;
  getUnreadCount: (memberId: string) => number;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  selectedMember,
  showMembersList,
  onMemberSelect,
  onToggleList,
  getUnreadCount
}) => {
  return (
    <div
      className={`
        transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900
        w-full md:w-80
        ${showMembersList ? 'absolute z-10 h-full md:static md:z-auto md:block' : 'hidden md:block'}
      `}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">الأعضاء ({members.length})</h3>
        <button
          onClick={onToggleList}
          className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="overflow-y-auto h-full">
        {members.map((member) => {
          const unreadCount = getUnreadCount(member._id);
          return (
            <div
              key={member._id}
              onClick={() => {
                onMemberSelect(member);
                if (window.innerWidth < 768) onToggleList(); // Hide on mobile after selection
              }}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                selectedMember?._id === member._id ? 'bg-gray-50 dark:bg-gray-900/20 border-r-4 border-r-gray-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 bg-gradient-to-r from-green-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold ${member.avatarUrl ? 'hidden' : ''}`}
                    style={{ display: member.avatarUrl ? 'none' : 'flex' }}
                  >
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembersList;
