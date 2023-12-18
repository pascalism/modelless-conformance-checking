import { useState, useEffect } from 'react';
import csvToJson from 'csvtojson';
import { without, isNil } from 'lodash';

export const colors = [
  { color: 'green', text: 'event is part of conformant variant' },
  { color: 'yellow', text: 'event is part of non-conformant variant' },
  { color: 'orange', text: 'event is likely non-conformant' },
  { color: 'red', text: 'event is non-conformant' },
];

export const sankeyColors = [
  { color: 'green', text: 'event is conformant' },
  { color: 'orange', text: 'event is likely non-conformant' },
  { color: 'red', text: 'event is non-conformant' },
];

export const findLabel = (row, leftOrRight) =>
  !isNil(row) &&
  !isNil(row[`log_label_${leftOrRight}`]) &&
  !isNil(JSON.parse(row[`log_label_${leftOrRight}`]?.replace(/'/g, '"'))[0])
    ? JSON.parse(row[`log_label_${leftOrRight}`]?.replace(/'/g, '"'))[0]
    : row[`${leftOrRight}_op`];

export const CONSTRAINT_LEVELS = [
  { text: 'Activity', value: 'Activity' },
  { text: 'Object', value: 'Object' },
  { text: 'Multi-object', value: 'Multi-object' },
  { text: 'Resource', value: 'Resource' },
];

export const RELEVANCE_LEVELS = [
  { text: '>0.5', value: '0.5' },
  { text: '>0.6', value: '0.6' },
  { text: '>0.7', value: '0.7' },
  { text: '>0.8', value: '0.8' },
  { text: '>0.9', value: '0.9' },
];

export const deleteSelected = (
  constraintData,
  selectedInputRows,
  setConstraintData
) => setConstraintData(without(constraintData, ...selectedInputRows));

export const filterFn = (rows, accessor, filterValue) => {
  if (filterValue.length > 0) {
    return rows.filter((row) => {
      const rowVal = row.values[accessor];
      if (filterValue.some((item) => rowVal?.includes(item))) {
        return true;
      }
      return false;
    });
  }
  return rows;
};

export const replaceAt = (array = [], index, value) => {
  const ret = [...array];
  ret[index] = value;
  return ret;
};

export const makeCompressedMapsExampleInput = () =>
  csvToJson({ delimiter: ';' })
    .fromString(`running_number;obs_id;Level;Object;constraint_string;op_type;dictionary;data_object;template;left_op;right_op;model_id;model_name;support;redundant;nat_lang_template;
		2;0f72c47b-e29f-4c86-afc9-a425009b34c3;Activity;;Exactly1[record order] | |;Unary;set();set();Exactly;record order;;1bb03792264e4bd6914da6aafe094f34 | ef5f51f1e9704dc29599a92cfb30a692 | 6dac76e0c4f44badafc4e303691276f3;BPMN | Project Kickoff | tutorial bpmn 1;3;FALSE;{1} occurs exactly {n} times;
		3;66e26a81-f1e2-4adc-9676-0273fa133e45;Activity;;Succession[record order, prepare order for shiping] | | |;Binary;set();set();Succession;record order;prepare order for shiping;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} occurs if and only if it is followed by {2};
		12;d050b805-0bb2-4135-aa70-491b56a3daa4;Activity;;Alternate Succession[record order, prepare order for shiping] | | |;Binary;set();set();Alternate Succession;record order;prepare order for shiping;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} and {2} occur if and only if the latter follows the former, and they alternate in a process instance;
		14;f000fef5-1703-4387-a119-daa4d474f1fb;Activity;;Responded Existence[place prescription in labeled box, check fulfillment request] | | |;Binary;set();set();Responded Existence;place prescription in labeled box;check fulfillment request;1bd1ef6b99d6492c9d533f9120462f18;Jane Doe - Receive prescription;1;FALSE;if {1} occurs in the process instance, then {2} occurs as well;
		1;d029cfdd-33ea-426e-b924-53e4482fd28e;Activity;;Exactly1[prepare order for shiping] | |;Unary;set();set();Exactly;prepare order for shiping;;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} occurs exactly {n} times;
		110947;0b09cc80-2a11-4c4b-b28d-97cdf022c915;Resource;sop clerk;Absence1[prepare order for shiping] |A.org:role is not sop clerk |;Unary;set();set();Absence;prepare order for shiping;;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} does not occur more than {n} times;"0b09cc80-2a11-4c4b-b28d-97cdf022c915 := ~(F(prepare_order_for_shiping));"
		110948;58dcb509-2482-4669-b000-5ad92e7322d7;Resource;sales rep;Absence1[record order] |A.org:role is not sales rep |;Unary;set();set();Absence;record order;;1bb03792264e4bd6914da6aafe094f34 | 6dac76e0c4f44badafc4e303691276f3;BPMN | tutorial bpmn 1;2;FALSE;{1} does not occur more than {n} times;"58dcb509-2482-4669-b000-5ad92e7322d7 := ~(F(record_order));"
		110949;3d655c2e-a30a-4f41-9921-c94a31ed9387;Resource;technician;Absence1[check fulfillment request] |A.org:role is not technician |;Unary;set();set();Absence;check fulfillment request;;1bd1ef6b99d6492c9d533f9120462f18;Jane Doe - Receive prescription;1;FALSE;{1} does not occur more than {n} times;"3d655c2e-a30a-4f41-9921-c94a31ed9387 := ~(F(check_fulfillment_request));"`);

export const makeCompressedMapsExampleOutput = () =>
  csvToJson({ delimiter: ';' })
    .fromString(`obs_id;Level;Object;constraint_string;op_type;dictionary;data_object;template;left_op;right_op;model_id;model_name;support;nat_lang_template;individual_relevance_scores;semantic_based_relevance;fitted_obs_id;relevance_score;violation;num_violations;cases
	6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_invoice receipt;Multi-object;;Succession[invoice, invoice receipt] | | |;Binary;set();set();Succession;reject purchase order;invoice receipt;['c29402e332d24592b6ccf23de3668a31', 'c96e600ddb7e49189eded1583f241966', '888965671e5a4ffc8371d037ee42fe27', '0ea3220f423447bba8b74fc4eae266cb', '83ba731d4b054652b5f412d9f3156411'];['W4 - P1(INTERMEDIATE-TIMER ENEVT) ', 'W4-P2(START-TIMER-EVENT) (VACATION)', 'W4-P1(INTERMEDIATE-TIMER-EVENT) ', 'W4-P2(INTERMEDIATE-TIMER-EVENT)', 'W4-P2(Start-Timer-Event)(Vacation)'];8;{1} occurs if and only if it is followed by {2};{'invoice': 0.7158427834510803, 'invoice receipt': 0.7916640639305115};0.7537534236907959;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_invoice receipt;0.5059089699099141;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_invoice receipt;3;['1', '2', '3']
	6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_subsequent invoice;Multi-object;;Succession[invoice, subsequent invoice] | | |;Binary;set();set();Succession;invoice;subsequent invoice;['c29402e332d24592b6ccf23de3668a31', 'c96e600ddb7e49189eded1583f241966', '888965671e5a4ffc8371d037ee42fe27', '0ea3220f423447bba8b74fc4eae266cb', '83ba731d4b054652b5f412d9f3156411'];['W4 - P1(INTERMEDIATE-TIMER ENEVT) ', 'W4-P2(START-TIMER-EVENT) (VACATION)', 'W4-P1(INTERMEDIATE-TIMER-EVENT) ', 'W4-P2(INTERMEDIATE-TIMER-EVENT)', 'W4-P2(Start-Timer-Event)(Vacation)'];8;{1} occurs if and only if it is followed by {2};{'invoice': 0.7158427834510803, 'subsequent invoice': 0.8053135275840759};0.7605781555175781;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_subsequent invoice;0.5093213358233052;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_invoice_Object_subsequent invoice;3;['1', '2', '3']
	6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_final invoice indicator_Object_invoice;Multi-object;;Succession[final invoice indicator, invoice] | | |;Binary;set();set();Succession;final invoice indicator;invoice;['c29402e332d24592b6ccf23de3668a31', 'c96e600ddb7e49189eded1583f241966', '888965671e5a4ffc8371d037ee42fe27', '0ea3220f423447bba8b74fc4eae266cb', '83ba731d4b054652b5f412d9f3156411'];['W4 - P1(INTERMEDIATE-TIMER ENEVT) ', 'W4-P2(START-TIMER-EVENT) (VACATION)', 'W4-P1(INTERMEDIATE-TIMER-EVENT) ', 'W4-P2(INTERMEDIATE-TIMER-EVENT)', 'W4-P2(Start-Timer-Event)(Vacation)'];8;{1} occurs if and only if it is followed by {2};{'final invoice indicator': 0.5791521668434143, 'invoice': 1.0};0.7895760834217072;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_final invoice indicator_Object_invoice;0.5238202997753697;6cb4cc59-4cee-490f-95f8-200a78c982e9_Object_final invoice indicator_Object_invoice;3;['1', '2', '3']
	84cc09d3-371a-4ed4-ba04-52762991afd6_Object_goods receipt_Object_invoice;Multi-object;;Succession[goods receipt, invoice] | | |;Binary;set();set();Succession;goods receipt;invoice;['4c22ae98038342bb817c5a86db39d067'];['Assignment 3 '];1;{1} occurs if and only if it is followed by {2};{'goods receipt': 1.000000238418579, 'invoice': 1.0};1.0000001192092896;84cc09d3-371a-4ed4-ba04-52762991afd6_Object_goods receipt_Object_invoice;0.5161290918627093;84cc09d3-371a-4ed4-ba04-52762991afd6_Object_goods receipt_Object_invoice;3;['1', '2', '3']
	3f8af14e-6a85-45d1-b006-073cdb1291ef_Object_invoice_Object_purchase order item;Multi-object;;Succession[invoice, purchase order item] | | |;Binary;set();set();Succession;invoice;purchase order item;['0454f87ea547417692576a911a14e17b'];['Week 2 Tutorial Activity 3 Jane Doe'];1;{1} occurs if and only if it is followed by {2};{'invoice': 1.0, 'purchase order item': 1.0};1.0;3f8af14e-6a85-45d1-b006-073cdb1291ef_Object_invoice_Object_purchase order item;0.5161290322580645;3f8af14e-6a85-45d1-b006-073cdb1291ef_Object_invoice_Object_purchase order item;3;['1', '2', '3']
	35da8fb1-9712-4c69-bdb1-c0a8fa1ffac1_Object_purchase order item_Object_invoice;Multi-object;;Alternate Succession[purchase order item, invoice] | | |;Binary;set();set();Alternate Succession;purchase order item;invoice;['0454f87ea547417692576a911a14e17b'];['Week 2 Tutorial Activity 3 Jane Doe'];1;{1} and {2} occur if and only if the latter follows the former, and they alternate in a process instance;{'purchase order item': 1.0, 'invoice': 1.0};1.0;35da8fb1-9712-4c69-bdb1-c0a8fa1ffac1_Object_purchase order item_Object_invoice;0.5161290322580645;35da8fb1-9712-4c69-bdb1-c0a8fa1ffac1_Object_purchase order item_Object_invoice;3;['1', '2', '3']
	c7693b7d-36e9-40e9-8d85-49c453225557_Object_invoice_Object_goods receipt;Multi-object;;Alternate Succession[invoice, goods receipt] | | |;Binary;set();set();Alternate Succession;invoice;goods receipt;['80a97308464a48379371b272733659a0'];['traditional process'];1;{1} and {2} occur if and only if the latter follows the former, and they alternate in a process instance;{'invoice': 1.0, 'goods receipt': 1.000000238418579};1.0000001192092896;c7693b7d-36e9-40e9-8d85-49c453225557_Object_invoice_Object_goods receipt;0.5161290918627093;c7693b7d-36e9-40e9-8d85-49c453225557_Object_invoice_Object_goods receipt;3;['1', '2', '3']`);

export const useDetectOutsideClick = (el, initialState, capture = false) => {
  const [isActive, setIsActive] = useState(initialState);

  useEffect(() => {
    const onClick = (e) => {
      // If the active element exists and is clicked outside of
      if (el.current !== null && !el.current.contains(e.target)) {
        setIsActive(false);
      }
    };

    // If the item is active (ie open) then listen for clicks outside
    if (isActive && window) {
      window?.addEventListener('click', onClick, capture);
    }

    return () => window?.removeEventListener('click', onClick, capture);
  }, [isActive, el, capture]);

  return [isActive, setIsActive];
};

export const objectMap = (obj, fn) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
