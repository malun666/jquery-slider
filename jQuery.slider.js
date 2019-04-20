(function(window, undefined) {
  $.fn.slider = function(options) {
    switch (getType(options)) {
      case 'String':  // 调用组件的方法
        var ret, args; // 返回值
        args = Array.prototype.slice.call(arguments, 1);
        this.each(function(index, item) {
          var temp = Slider.prototype[options].apply($(item).data(), args);
          index == 0 && (ret = temp);
        });
        return ret;
      case 'Object':
      case 'Undefined': // 组件初始化
        break;
      default:
        throw new Error(
          'slider组件的方法第一次参数：可以为空、字符串、Object类型。'
        );
    }

    // 为每个匹配的元素都创建对象，并存储。选择可能是多个的情况处理。
    this.each(function(index, item) {
      $(item).data(new Slider(options, $(item))); //$.fn.data(); //
    });
  };

  /**
   * 初始化slider的构造函数
   * @param {Object|String} options
   * @param {jQuery对象实例} target
   */
  function Slider(options, target) {
    // 设置新状态，修改默认状态
    this.state = $.extend({}, Slider.defaults, options);

    // 校验参数
    if (this.state.min > this.state.val) {
      throw new Error('设置的val值不能小于最小值！');
    }
    if (this.state.max < this.state.val) {
      throw new Error('设置的val值不能大于最大值！');
    }

    // 储存当前slider实例所在的：jq对象
    this.target = target;
    this.init(); // 给用户传来的所有的设置做一些初始化， 绑定用户给的自定义事件，绑定dom处理逻辑
  }

  // 全局的默认设置参数
  Slider.defaults = {
    min: 0,
    max: 100,
    val: 0,
    step: 1
  };

  // 定义方法
  $.extend(Slider.prototype, {
    init: function() {
      // 初始化绑定事件
      this._bindEvent();
      this.target.trigger('onBeforeInit');
      // 进行初始化标签
      this.target.append(
        '<div class="slider-wrap"><div class="slider-range"></div><div class="slider-hand' +
          'ler"></div></div>'
      );

      // 初始化拖动事件
      var handler = this.target.find('.slider-handler');
      var _slider = this;
      _slider._movestate = {
        parentWidth: this.target.find('.slider-wrap').width(),
        x: getLeft(
          this.state.min,
          this.state.max,
          this.state.val,
          this.target.width()
        )
      };

      handler.on('mousedown', function(e) {
        _slider._movestate._isMove = true;
        _slider._movestate.originPositon = parseFloat(mousePos(e).x); // 鼠标开始拖动的位置
        _slider._movestate.lastTime = Date.now();
      });
      this.target.on('mouseup mouseleave', function() {
        _slider._movestate._isMove = false;
      });

      // this.target.on('mouseleave', function(e) {     _slider._movestate._isMove =
      // false; });

      this.target.find('.slider-range').on('click', function(e) {
        // 计算位移并计算新的val，并设置值。
        var max = _slider.state.max;
        var min = _slider.state.min;
        var parentWith = _slider.target.find('.slider-wrap').width();
        var xNew = e.offsetX;
        _slider._movestate.x = xNew;
        _slider.setVal((xNew / parentWith) * (max - min) + min);
        e.stopPropagation();
      });
      this.target.on('mousemove', function(e) {
        if (
          _slider._movestate._isMove &&
          Date.now() - _slider._movestate.lastTime > 30
        ) {
          // 计算位移并计算新的val，并设置值。
          var max = _slider.state.max;
          var min = _slider.state.min;
          var parentWith = _slider._movestate.parentWidth;
          var x = _slider._movestate.x;
          var xNew =
            x + parseFloat(mousePos(e).x) - _slider._movestate.originPositon;
          xNew > parentWith && (xNew = parentWith);
          xNew < 0 && (xNew = 0);
          _slider._movestate.x = xNew;
          _slider._movestate.originPositon = parseFloat(mousePos(e).x); // 鼠标上一次move事件拖动的位置
          _slider._movestate.lastTime = Date.now(); // 记录上次时间，控制
          _slider.setVal((xNew / parentWith) * (max - min) + min);
        }
      });

      // 触发：初始化事件
      this.target.trigger('onInit');
      this.setVal(this.state, true); // 设置值但不触发change事件
      this.target.trigger('onLoad', [this.state.val]);
    },
    _bindEvent: function() {
      // 初始化事件
      if (this.state.onLoad) {
        this.target.on('onLoad', this.state.onLoad);
      }
      if (this.state.onInit) {
        this.target.on('onInit', this.state.onInit);
      }
      if (this.state.onChange) {
        this.target.on('onChange', this.state.onChange);
      }
      if (this.state.onBeforeInit) {
        this.target.on('onBeforeInit', this.state.onBeforeInit);
      }
    },
    /**
     * 设置val属性，其实可以顺便设置min、max、val值，那么就需要传入一个对象。传入一个数字表示：设置val值。
     * @param {Object|Number} 设置值，可以是对象或者数字
     */
    setVal: function(opt, noChangeEvent) {
      if (getType(opt) === 'Object') {
        $.extend(this.state, opt);
      } else if (getType(opt) === 'Number') {
        this.state.val = Math.round(opt);
        this._movestate.x = this.x();
      } else {
        throw new Error('slider的设置方法只能传入对象或者数字！');
      }
      !noChangeEvent &&
        this.target.trigger('onChange', [Math.round(this.state.val)]);
      // 设置位置
      this.target.find('.slider-handler').css('left', this.x() + 'px');
      // this.target.find('.slider-handler').css('left', getPercent(this.state) +'%');
    },
    getVal: function() {
      return Math.round(this.state.val);
    },
    /**
     * 计算滑块的坐标
     * @return {Number} 返回坐标
     */
    x: function() {
      return (
        ((this.state.val - this.state.min) /
          (this.state.max - this.state.min)) *
        this._movestate.parentWidth
      );
    }
  });

  /**
   * 获取滑块的坐标,left值
   * @param {Number} min 滑块最小值
   * @param {Number} max 滑块的最大值
   * @param {Number} val 值
   * @param {Number} width 滑板的宽度
   */
  function getLeft(min, max, val, width) {
    return ((val - min) / (max - min)) * width;
  }
  /**
   * 获取百分比，例如： {min: 0, max: 100, val: 30} => 30%
   * @param {Object} state
   * @return {Number} 返回val的百分比，0-100之间
   */
  function getPercent(state) {
    return ((state.val - state.min) / (state.max - state.min)) * 100;
  }

  /**
   * 获取任意对象的 类型名
   * @param {any} a
   * @returns {String} 类型名
   */
  function getType(a) {
    return Object.prototype.toString.call(a).slice(8, -1);
  }

  /**
   * 获取事件对象的页面坐标
   * @param {Object} e
   * @return {x: 22, y: 333}
   */
  function mousePos(e) {
    var x, y;
    var e = e || window.event;
    return {
      x:
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft,
      y:
        e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
  }
})(window);
