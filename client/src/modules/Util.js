class Util {
    static searchTree(element, id){
        if(element.id === id){
             return element;
        } else if (element.children && element.children.length > 0){
             var i;
             var result = null;
             for(i = 0; result == null && i < element.children.length; i++){
                  result = Util.searchTree(element.children[i], id);
             }
             return result;
        }
        return null;
    }
}

export default Util;