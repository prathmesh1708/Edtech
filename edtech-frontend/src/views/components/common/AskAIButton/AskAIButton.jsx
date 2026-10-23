import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ClipboardList } from 'lucide-react';
import Button from '../Button/Button';
import { ROUTES } from '../../../../config/routes';

/**
 * Opens AI Chat (or, with `practice`, a Practice Quiz) scoped to the current page.
 *
 * @param {Object} props
 * @param {string} [props.subject] subject name, e.g. "Mathematics"
 * @param {{ chapterId?: string, chapterName?: string, materialId?: string, materialTitle?: string, topic?: string }} [props.context]
 * @param {string} [props.prefill] question to pre-fill in the chat composer
 * @param {boolean} [props.practice] open Practice Quiz instead of AI Chat
 */
const AskAIButton = ({ subject, context, prefill, practice = false, children, variant = 'outline', size = 'sm', ...props }) => {
  const navigate = useNavigate();

  const open = (e) => {
    e.stopPropagation();
    navigate(practice ? ROUTES.AI_PRACTICE : ROUTES.AI_CHAT, { state: { subject, context, prefill } });
  };

  return (
    <Button
      variant={variant}
      size={size}
      iconLeft={practice ? <ClipboardList size={15} /> : <Sparkles size={15} />}
      onClick={open}
      {...props}
    >
      {children || (practice ? 'Practice quiz' : 'Ask AI Tutor')}
    </Button>
  );
};

export default AskAIButton;
