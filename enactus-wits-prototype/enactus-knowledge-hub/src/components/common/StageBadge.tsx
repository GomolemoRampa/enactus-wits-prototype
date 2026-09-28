import React from 'react';
import { CourseBusinessStage } from '../../types/course';

interface StageBadgeProps {
  stage: CourseBusinessStage | string;
  size?: 'sm' | 'md';
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, size = 'sm' }) => {
  let tagClass = 'flat-tag-all';
  
  if (stage === 'Idea') {
    tagClass = 'flat-tag-idea';
  } else if (stage === 'Prototype') {
    tagClass = 'flat-tag-prototype';
  } else if (stage === 'Running Business') {
    tagClass = 'flat-tag-running';
  } else if (stage === 'All Stages') {
    tagClass = 'flat-tag-accent';
  }

  const paddingStyle = size === 'md' ? { padding: '3px 8px', fontSize: '11px' } : {};

  return (
    <span className={`flat-tag ${tagClass}`} style={paddingStyle}>
      {stage}
    </span>
  );
};
