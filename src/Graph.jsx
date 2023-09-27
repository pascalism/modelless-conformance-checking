import Graphviz from 'graphviz-react';

const content = `
digraph {
fontname="Open Sans"
node [fontname="Open Sans",fontcolor="white"]
edge [fontname="Open Sans"]



				subgraph cluster_1 {
				node [style=filled,color="#AD0F5B"]
				label="Variant #1; Prob: 0.6"

                    
recordorder askforpermission prepareorderforshiping changeapprovalforpurchaseorder waitforreply receiveorderconfirmation  
                    
}



				subgraph cluster_2 {
				node [style=filled,color="#AD0F5B"]
				label="Variant #2; Prob: 0.3"

                    
recordorder checkfulfillmentrequest askforpermission prepareorderforshiping cancelrequest  
                    
}



				subgraph cluster_3 {
				node [style=filled,color="#AD0F5B"]
				label="Variant #3; Prob: 0.1"

                    placeprescriptioninlabeledbox  
                    
}


	
start -> recordorder
recordorder -> askforpermission
askforpermission -> prepareorderforshiping
prepareorderforshiping -> changeapprovalforpurchaseorder
changeapprovalforpurchaseorder -> waitforreply
waitforreply -> receiveorderconfirmation
receiveorderconfirmation -> end

recordorder -> checkfulfillmentrequest
checkfulfillmentrequest -> askforpermission
prepareorderforshiping -> cancelrequest
cancelrequest -> end
start -> placeprescriptioninlabeledbox -> end
askforpermission -> receiveorderconfirmation [dir=back]
	
start [shape=Mdiamond, fontcolor="black"]
end  [shape=Mdiamond, fontcolor="black"]
}`;

const Graph = () => {
  return <Graphviz options={[{ zoom: true }]} dot={content} />;
};

export default Graph;
