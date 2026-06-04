import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LlmConfigPage from './LlmConfigPage';
import AssessmentAdminPage from './AssessmentAdminPage';
import UsersPage from './UsersPage';
import ModerationPage from './ModerationPage';
import HrManagementPage from './HrManagementPage';
import ProfileTab from './ProfileTab';
import LlmLogTab from './LlmLogTab';

const TABS = [
  { id: 'llm-config', label: 'Настройка LLM' },
  { id: 'llm-log', label: 'Лог LLM' },
  { id: 'assessment', label: 'Настройка теста' },
  { id: 'users', label: 'Пользователи' },
  { id: 'moderation', label: 'Модерация предприятий' },
  { id: 'profile', label: 'Мой профиль' },
  { id: 'hr', label: 'HR' },
];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'llm-config';

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'llm-config': return <LlmConfigPage />;
      case 'llm-log': return <LlmLogTab />;
      case 'assessment': return <AssessmentAdminPage />;
      case 'users': return <UsersPage />;
      case 'moderation': return <ModerationPage />;
      case 'profile': return <ProfileTab />;
      case 'hr': return <HrManagementPage />;
      default: return <LlmConfigPage />;
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Админ-панель</h2>
        <p>Управление платформой и настройками</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : ''}`}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-tab-content">
        {renderContent()}
      </div>
    </div>
  );
}