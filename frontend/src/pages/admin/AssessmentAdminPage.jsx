import { useState, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

function SortableQuestion({ question, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`question-card ${!question.isActive ? 'question-inactive' : ''}`}>
      <div className="question-drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <div className="question-body">
        <div className="question-header">
          <span className="question-code">{question.code}</span>
          <span className={`badge ${question.type === 'multi' ? 'badge-info' : 'badge-primary'}`}>
            {question.type === 'multi' ? 'multi' : 'single'}
          </span>
          <span className="question-weight">Вес: {parseFloat(question.weight).toFixed(1)}</span>
          <span className="question-options-count">Вариантов: {(question.optionsJson || []).length}</span>
          <button
            className={`toggle-btn ${question.isActive ? 'toggle-on' : 'toggle-off'}`}
            onClick={() => onToggle(question.id)}
            title={question.isActive ? 'Скрыть' : 'Показать'}
          >
            {question.isActive ? '🟢' : '🔴'}
          </button>
        </div>
        <p className="question-text">{question.text}</p>
        <div className="question-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onEdit(question)}>Редактировать</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(question.id)}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

const emptyOption = { value: '', label: '', freeText: false };

export default function AssessmentAdminPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', text: '', type: 'single', weight: 1.0, optionsJson: [{ ...emptyOption }] });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAssessmentQuestions();
      setQuestions(data);
    } catch (e) {
      toast.error('Ошибка загрузки вопросов');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveOrder = async () => {
    try {
      const items = questions.map((q, i) => ({ id: q.id, sortOrder: i }));
      await adminAPI.reorderAssessmentQuestions(items);
      toast.success('Порядок сохранён');
      loadQuestions();
    } catch (e) {
      toast.error('Ошибка сохранения порядка');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: '', text: '', type: 'single', weight: 1.0, optionsJson: [{ ...emptyOption }] });
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({
      code: q.code,
      text: q.text,
      type: q.type,
      weight: parseFloat(q.weight),
      optionsJson: q.optionsJson?.length > 0 ? q.optionsJson : [{ ...emptyOption }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.text) { toast.error('Код и текст обязательны'); return; }
    try {
      if (editingId) {
        await adminAPI.updateAssessmentQuestion(editingId, form);
        toast.success('Вопрос обновлён');
      } else {
        await adminAPI.createAssessmentQuestion(form);
        toast.success('Вопрос создан');
      }
      setShowModal(false);
      loadQuestions();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить вопрос?')) return;
    try {
      await adminAPI.deleteAssessmentQuestion(id);
      toast.success('Вопрос удалён');
      loadQuestions();
    } catch (e) {
      toast.error('Ошибка удаления');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleAssessmentQuestion(id);
      toast.success('Статус изменён');
      loadQuestions();
    } catch (e) {
      toast.error('Ошибка');
    }
  };

  const addOption = () => {
    setForm({ ...form, optionsJson: [...form.optionsJson, { ...emptyOption }] });
  };

  const removeOption = (index) => {
    if (form.optionsJson.length <= 1) return;
    const opts = form.optionsJson.filter((_, i) => i !== index);
    setForm({ ...form, optionsJson: opts });
  };

  const updateOption = (index, field, value) => {
    const opts = [...form.optionsJson];
    opts[index] = { ...opts[index], [field]: value };
    setForm({ ...form, optionsJson: opts });
  };

  if (loading) return <div className="page-content"><p>Загрузка...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Настройка теста (опросника ассессмента)</h2>
        <p>Управление вопросами профориентационного тестирования</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить вопрос</button>
        <button className="btn btn-success" onClick={saveOrder}>Сохранить порядок</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
          <div className="questions-list">
            {questions.length === 0 && <p className="text-gray-500">Нет вопросов</p>}
            {questions.map((q) => (
              <SortableQuestion key={q.id} question={q} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Редактировать вопрос' : 'Новый вопрос'}</h3>

            <div className="form-group">
              <label>Код</label>
              <input type="text" className="form-control" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Текст вопроса</label>
              <textarea className="form-control" rows={3} value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })} required />
            </div>

            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label>Тип</label>
                  <select className="form-control" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="single">single</option>
                    <option value="multi">multi</option>
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="form-group">
                  <label>Вес (0.1–5.0)</label>
                  <input type="number" step="0.1" min="0.1" max="5.0" className="form-control"
                    value={form.weight} onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 1.0 })} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Варианты ответов</label>
              {form.optionsJson.map((opt, i) => (
                <div key={i} className="option-row">
                  <input type="text" placeholder="value" className="form-control-sm"
                    value={opt.value} onChange={(e) => updateOption(i, 'value', e.target.value)} />
                  <input type="text" placeholder="label" className="form-control-sm"
                    value={opt.label} onChange={(e) => updateOption(i, 'label', e.target.value)} />
                  <label className="option-free-text">
                    <input type="checkbox" checked={opt.freeText || false}
                      onChange={(e) => updateOption(i, 'freeText', e.target.checked)} />
                    <span>freeText</span>
                  </label>
                  <button className="btn btn-sm btn-danger" onClick={() => removeOption(i)} disabled={form.optionsJson.length <= 1}>
                    ✕
                  </button>
                </div>
              ))}
              <button className="btn btn-sm btn-outline mt-1" onClick={addOption}>+ Добавить вариант</button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}