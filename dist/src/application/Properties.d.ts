import { Class } from '../public/Class.js';
import { MessageHandler } from '../messages/MessageHandler.js';
import { Canvas as CanvasType } from './interfaces/Canvas.js';
import { ComponentFactory } from './interfaces/ComponentFactory.js';
import { Tag } from './tags/Tag.js';
export declare enum ScrollDirection {
    Up = 0,
    Down = 1
}
export interface ClassNames {
    Invalid: string;
    RowIndicator: string;
    FilterIndicator: string;
}
/**
 * These are global properties used in different parts of the code.
 * If, for some reason, the tags, style classes etc conflicts with other usage,
 * anything can be changed.
 */
export declare class Properties {
    static baseurl: string;
    static ParseTags: boolean;
    static ParseEvents: boolean;
    static IncludeTag: string;
    static FormTag: string;
    static BindAttr: string;
    static RecordModeAttr: string;
    static ImplAttr: string;
    static ForeachAttr: string;
    static DateDelimitors: string;
    static TimeFormat: string;
    static DateFormat: string;
    static AttributePrefix: string;
    static RequireAttributePrefix: boolean;
    static IndicatorType: string;
    static FilterIndicatorType: string;
    static Classes: ClassNames;
    /** Interceptor for message handling */
    static get MessageHandler(): MessageHandler;
    /** Interceptor for message handling */
    static set MessageHandler(handler: MessageHandler);
    static CanvasImplementationClass: Class<CanvasType>;
    static FactoryImplementation: ComponentFactory;
    static MouseScrollDirection: ScrollDirection;
    static TagLibrary: Map<string, Class<Tag>>;
    static FieldTypeLibrary: Map<string, Class<Tag>>;
    static AttributeLibrary: Map<string, Class<Tag>>;
}
