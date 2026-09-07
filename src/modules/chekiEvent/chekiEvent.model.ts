import {IEventsBody} from "../events/events.model";
import {IChekiBody} from "../cheki/cheki.models";

export interface IChekiEventBody {
  event: IEventsBody;
  member_uuids: string[];
  packages: IChekiBody[];
}

export interface IUpdateChekiEventBody {
  event?: Partial<IEventsBody>;
  member_uuids?: string[];
  packages?: Partial<IChekiBody[]>;
}

