var windowURL = window.URL || window.webkitURL;

ko.bindingHandlers.file = {
    init: function(element, valueAccessor) {
        $(element).change(function() {
            var file = this.files[0];
            if (ko.isObservable(valueAccessor())) {
                valueAccessor()(file);
            }
        });
    },

    update: function(element, valueAccessor, allBindingsAccessor) {
        var file = ko.utils.unwrapObservable(valueAccessor());
        var bindings = allBindingsAccessor();

        if (bindings.fileObjectURL && ko.isObservable(bindings.fileObjectURL)) {
            var oldUrl = bindings.fileObjectURL();
            if (oldUrl) {
                windowURL.revokeObjectURL(oldUrl);
            }
            bindings.fileObjectURL(file && windowURL.createObjectURL(file));
        }

        if (bindings.fileBinaryData && ko.isObservable(bindings.fileBinaryData)) {
            if (!file) {
                bindings.fileBinaryData(null);
            } else {
                var reader = new FileReader();
                reader.onload = function(e) {
                    bindings.fileBinaryData(e.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }
};

var imageListModel = function() {
    var self = {};

    var slotModel = function() {
        var that = {};

        that.imageFile = ko.observable();
        that.imageObjectURL = ko.observable();
        that.imageBinary = ko.observable();

        that.fileSize = ko.computed(function() {
            var file = this.imageFile();
            return file ? file.size : 0;
        }, that);

        that.firstBytes = ko.computed(function() {
            if (that.imageBinary()) {
                var buf = new Uint8Array(that.imageBinary());
                var bytes = [];
                for (var i = 0; i < Math.min(10, buf.length); ++i) {
                    bytes.push(buf[i]);
                }
                return '[' + bytes.join(', ') + ']';
            } else {
                return '';
            }
        }, that);

        return that;
    };

    self.beforeRemoveSlot = function(element, index, data) {
        if (data.imageObjectURL()) {
            windowURL.revokeObjectURL(data.imageObjectURL());
        }
        $(element).remove();
    };

    self.images = ko.observableArray([slotModel()]);

    self.addSlot = function() {
        self.images.push(slotModel());
    };

    self.removeSlot = function(data) {
        self.images.remove(data);
    };

    return self;
}();
