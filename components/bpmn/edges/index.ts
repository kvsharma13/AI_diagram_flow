import SequenceFlowEdge from './SequenceFlowEdge';
import MessageFlowEdge from './MessageFlowEdge';

export const bpmnEdgeTypes = {
  sequenceFlow: SequenceFlowEdge,
  messageFlow: MessageFlowEdge,
  association: SequenceFlowEdge,
};
