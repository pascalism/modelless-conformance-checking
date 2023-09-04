import { useState, useEffect } from "react"
import csvToJson from "csvtojson"

export const CONSTRAINT_LEVELS = [
    // { text: "Activity", value: "Activity" },
    { text: "Activity", value: "Activity" },
    { text: "Object", value: "Object" },
    { text: "Multi Object", value: "Multi-object" },
    { text: "Resource", value: "Resource" },
]

export const makeCompressedMaps = () =>
    csvToJson({ delimiter: ";" })
        .fromString(`running_number;obs_id;Level;Object;constraint_string;op_type;dictionary;data_object;template;left_op;right_op;model_id;model_name;support;redundant;nat_lang_template;
		2;0f72c47b-e29f-4c86-afc9-a425009b34c3;Activity;;Exactly1[record order] | |;Unary;set();set();Exactly;record order;;1bb03792264e4bd6914da6aafe094f34 | ef5f51f1e9704dc29599a92cfb30a692 | 6dac76e0c4f44badafc4e303691276f3;BPMN | Project Kickoff | tutorial bpmn 1;3;FALSE;{1} occurs exactly {n} times;
		3;66e26a81-f1e2-4adc-9676-0273fa133e45;Activity;;Succession[record order, prepare order for shiping] | | |;Binary;set();set();Succession;record order;prepare order for shiping;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} occurs if and only if it is followed by {2};
		12;d050b805-0bb2-4135-aa70-491b56a3daa4;Activity;;Alternate Succession[record order, prepare order for shiping] | | |;Binary;set();set();Alternate Succession;record order;prepare order for shiping;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} and {2} occur if and only if the latter follows the former, and they alternate in a process instance;
		14;f000fef5-1703-4387-a119-daa4d474f1fb;Activity;;Responded Existence[place prescription in labeled box, check fulfillment request] | | |;Binary;set();set();Responded Existence;place prescription in labeled box;check fulfillment request;1bd1ef6b99d6492c9d533f9120462f18;Jane Doe - Receive prescription;1;FALSE;if {1} occurs in the process instance, then {2} occurs as well;
		1;d029cfdd-33ea-426e-b924-53e4482fd28e;Activity;;Exactly1[prepare order for shiping] | |;Unary;set();set();Exactly;prepare order for shiping;;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} occurs exactly {n} times;
		110947;0b09cc80-2a11-4c4b-b28d-97cdf022c915;Resource;sop clerk;Absence1[prepare order for shiping] |A.org:role is not sop clerk |;Unary;set();set();Absence;prepare order for shiping;;1bb03792264e4bd6914da6aafe094f34;BPMN;1;FALSE;{1} does not occur more than {n} times;"0b09cc80-2a11-4c4b-b28d-97cdf022c915 := ~(F(prepare_order_for_shiping));"
		110948;58dcb509-2482-4669-b000-5ad92e7322d7;Resource;sales rep;Absence1[record order] |A.org:role is not sales rep |;Unary;set();set();Absence;record order;;1bb03792264e4bd6914da6aafe094f34 | 6dac76e0c4f44badafc4e303691276f3;BPMN | tutorial bpmn 1;2;FALSE;{1} does not occur more than {n} times;"58dcb509-2482-4669-b000-5ad92e7322d7 := ~(F(record_order));"
		110949;3d655c2e-a30a-4f41-9921-c94a31ed9387;Resource;technician;Absence1[check fulfillment request] |A.org:role is not technician |;Unary;set();set();Absence;check fulfillment request;;1bd1ef6b99d6492c9d533f9120462f18;Jane Doe - Receive prescription;1;FALSE;{1} does not occur more than {n} times;"3d655c2e-a30a-4f41-9921-c94a31ed9387 := ~(F(check_fulfillment_request));"`)

export const useDetectOutsideClick = (el, initialState, capture = false) => {
    const [isActive, setIsActive] = useState(initialState)

    useEffect(() => {
        const onClick = (e) => {
            // If the active element exists and is clicked outside of
            if (el.current !== null && !el.current.contains(e.target)) {
                setIsActive(false)
            }
        }

        // If the item is active (ie open) then listen for clicks outside
        if (isActive && window) {
            window?.addEventListener("click", onClick, capture)
        }

        return () => window?.removeEventListener("click", onClick, capture)
    }, [isActive, el, capture])

    return [isActive, setIsActive]
}
