function Tree() {
    this._root = null;

    this._traverse = function(callback) {
        function walk(node) {
          callback(node);
          node.children.forEach(walk);
        }
        walk(this._root);
    }

    this.add = function(value, parentValue) {
        var newNode = {
          value,
          children: []
        };
    
        if (null === this._root) {
          this._root = newNode;
          return;
        }
    
        this._traverse(function(node) {
          if (parentValue === node.value) {
            node.children.push(newNode);
          }
        });
      }

    this.remove = function(value) {
        this._traverse(function(node) {
            node.children.some(function(childNode, index) {
            if (value === childNode.value) {
                return !!node.children.splice(index, 1);
            }
            });
        });
    }

    this.search = function(value) {
        let exists = false;

        this._traverse(function(node) {
            if (value === node.value) {
            exists = true;
            }
        });

        return exists;
    }
}
