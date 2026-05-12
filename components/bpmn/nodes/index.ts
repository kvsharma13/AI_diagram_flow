import StartEventNode from './StartEventNode';
import EndEventNode from './EndEventNode';
import TaskNode from './TaskNode';
import GatewayNode from './GatewayNode';
import SubProcessNode from './SubProcessNode';
import IntermediateEventNode from './IntermediateEventNode';
import DataObjectNode from './DataObjectNode';
import SwimlaneNode from './SwimlaneNode';

export const bpmnNodeTypes = {
  startEvent: StartEventNode,
  endEvent: EndEventNode,
  task: TaskNode,
  userTask: TaskNode,
  serviceTask: TaskNode,
  scriptTask: TaskNode,
  exclusiveGateway: GatewayNode,
  parallelGateway: GatewayNode,
  inclusiveGateway: GatewayNode,
  subProcess: SubProcessNode,
  intermediateEvent: IntermediateEventNode,
  dataObject: DataObjectNode,
  dataStore: DataObjectNode,
  textAnnotation: DataObjectNode,
  swimlane: SwimlaneNode,
};
