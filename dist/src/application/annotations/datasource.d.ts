import { Form } from '../../public/Form.js';
import { Class } from '../../public/Class.js';
import { Block } from '../../public/Block.js';
import { DataSource } from '../../model/interfaces/DataSource.js';
/**
 *
 * Annotations provides a short and easy way to inject code.
 *
 * The following:
 *
 * @datasource("employees",Employees)
 *
 * Will create a datasource 'employees' and a block also called 'employees'.
 * Bind the block to the datasource and inject it into the form.
 *
 */
export declare const datasource: (block: Block | string, source: Class<DataSource> | DataSource) => (form: Class<Form>) => void;
