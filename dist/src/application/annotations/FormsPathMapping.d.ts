import { Class } from '../../public/Class.js';
import { FormsModule } from '../FormsModule.js';
/**
 * The basic class for components
 * like Forms
 */
export interface Component {
    path: string;
    class: Class<any>;
    navigable?: boolean;
}
/**
 *
 * @param components : A list of components and their mapping
 *
 * HTML is pure text and often FutureForms needs to know how to translate
 * a given path/name into a class. This is done by injecting the class and
 * a path/name into the FutureForms engine.
 *
 */
export declare const FormsPathMapping: (components: (Class<any> | Component)[]) => (_comp_: Class<FormsModule>) => void;
