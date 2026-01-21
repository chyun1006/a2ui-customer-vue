
import React from 'react';
import { A2UIWidgetPayload } from '../../types';
import DynamicWidget from './DynamicWidget';

interface A2UIRendererProps {
  payload: A2UIWidgetPayload;
  onActionClick?: (displayText: string, hiddenContext?: string) => void;
}

/**
 * 鸿小通 UI 渲染引擎
 * 核心逻辑：根据 AI 返回的 UINode 树进行递归动态渲染。
 * 确保所有业务界面均能根据语境实时动态生成。
 */
const A2UIRenderer: React.FC<A2UIRendererProps> = ({ payload, onActionClick }) => {
  return (
    <DynamicWidget 
      data={payload.rootNode} 
      title={payload.title}
      analysis={payload.analysis}
      onActionClick={onActionClick} 
    />
  );
};

export default A2UIRenderer;
