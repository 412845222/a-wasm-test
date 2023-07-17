System.register("chunks:///_virtual/debug-view-runtime-control.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, Canvas, UITransform, instantiate, Label, Color, RichText, Toggle, Button, director, Component;

  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Canvas = module.Canvas;
      UITransform = module.UITransform;
      instantiate = module.instantiate;
      Label = module.Label;
      Color = module.Color;
      RichText = module.RichText;
      Toggle = module.Toggle;
      Button = module.Button;
      director = module.director;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;

      cclegacy._RF.push({}, "b2bd1+njXxJxaFY3ymm06WU", "debug-view-runtime-control", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var DebugViewRuntimeControl = exports('DebugViewRuntimeControl', (_dec = ccclass('internal.DebugViewRuntimeControl'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DebugViewRuntimeControl, _Component);

        function DebugViewRuntimeControl() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_this, "compositeModeToggle", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_this, "singleModeToggle", _descriptor2, _assertThisInitialized(_this));

          _initializerDefineProperty(_this, "EnableAllCompositeModeButton", _descriptor3, _assertThisInitialized(_this));

          _this._single = 0;
          _this.strSingle = ['No Single Debug', 'Vertex Color', 'Vertex Normal', 'Vertex Tangent', 'World Position', 'Vertex Mirror', 'Face Side', 'UV0', 'UV1', 'UV Lightmap', 'Project Depth', 'Linear Depth', 'Fragment Normal', 'Fragment Tangent', 'Fragment Binormal', 'Base Color', 'Diffuse Color', 'Specular Color', 'Transparency', 'Metallic', 'Roughness', 'Specular Intensity', 'IOR', 'Direct Diffuse', 'Direct Specular', 'Direct All', 'Env Diffuse', 'Env Specular', 'Env All', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Fresnel', 'Direct Transmit Diffuse', 'Direct Transmit Specular', 'Env Transmit Diffuse', 'Env Transmit Specular', 'Transmit All', 'Direct Internal Specular', 'Env Internal Specular', 'Internal All', 'Fog'];
          _this.strComposite = ['Direct Diffuse', 'Direct Specular', 'Env Diffuse', 'Env Specular', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Normal Map', 'Fog', 'Tone Mapping', 'Gamma Correction', 'Fresnel', 'Transmit Diffuse', 'Transmit Specular', 'Internal Specular', 'TT'];
          _this.strMisc = ['CSM Layer Coloration', 'Lighting With Albedo'];
          _this.compositeModeToggleList = [];
          _this.singleModeToggleList = [];
          _this.miscModeToggleList = [];
          _this.textComponentList = [];
          _this.labelComponentList = [];
          _this.textContentList = [];
          _this.hideButtonLabel = void 0;
          _this._currentColorIndex = 0;
          _this.strColor = ['<color=#ffffff>', '<color=#000000>', '<color=#ff0000>', '<color=#00ff00>', '<color=#0000ff>'];
          _this.color = [Color.WHITE, Color.BLACK, Color.RED, Color.GREEN, Color.BLUE];
          return _this;
        }

        var _proto = DebugViewRuntimeControl.prototype;

        _proto.start = function start() {
          // get canvas resolution
          var canvas = this.node.parent.getComponent(Canvas);

          if (!canvas) {
            console.error('debug-view-runtime-control should be child of Canvas');
            return;
          }

          var uiTransform = this.node.parent.getComponent(UITransform);
          var halfScreenWidth = uiTransform.width * 0.5;
          var halfScreenHeight = uiTransform.height * 0.5;
          var x = -halfScreenWidth + halfScreenWidth * 0.1,
              y = halfScreenHeight - halfScreenHeight * 0.1;
          var width = 200,
              height = 20; // new nodes

          var miscNode = this.node.getChildByName('MiscMode');
          var buttonNode = instantiate(miscNode);
          buttonNode.parent = this.node;
          buttonNode.name = 'Buttons';
          var titleNode = instantiate(miscNode);
          titleNode.parent = this.node;
          titleNode.name = 'Titles'; // title

          for (var i = 0; i < 2; i++) {
            var newLabel = instantiate(this.EnableAllCompositeModeButton.getChildByName('Label'));
            newLabel.setPosition(x + (i > 0 ? 50 + width * 2 : 150), y, 0.0);
            newLabel.setScale(0.75, 0.75, 0.75);
            newLabel.parent = titleNode;

            var _labelComponent = newLabel.getComponent(Label);

            _labelComponent.string = i ? '----------Composite Mode----------' : '----------Single Mode----------';
            _labelComponent.color = Color.WHITE;
            _labelComponent.overflow = 0;
            this.labelComponentList[this.labelComponentList.length] = _labelComponent;
          }

          y -= height; // single

          var currentRow = 0;

          for (var _i = 0; _i < this.strSingle.length; _i++, currentRow++) {
            if (_i === this.strSingle.length >> 1) {
              x += width;
              currentRow = 0;
            }

            var newNode = _i ? instantiate(this.singleModeToggle) : this.singleModeToggle;
            newNode.setPosition(x, y - height * currentRow, 0.0);
            newNode.setScale(0.5, 0.5, 0.5);
            newNode.parent = this.singleModeToggle.parent;
            var textComponent = newNode.getComponentInChildren(RichText);
            textComponent.string = this.strSingle[_i];
            this.textComponentList[this.textComponentList.length] = textComponent;
            this.textContentList[this.textContentList.length] = textComponent.string;
            newNode.on(Toggle.EventType.TOGGLE, this.toggleSingleMode, this);
            this.singleModeToggleList[_i] = newNode;
          }

          x += width; // buttons

          this.EnableAllCompositeModeButton.setPosition(x + 15, y, 0.0);
          this.EnableAllCompositeModeButton.setScale(0.5, 0.5, 0.5);
          this.EnableAllCompositeModeButton.on(Button.EventType.CLICK, this.enableAllCompositeMode, this);
          this.EnableAllCompositeModeButton.parent = buttonNode;
          var labelComponent = this.EnableAllCompositeModeButton.getComponentInChildren(Label);
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          var changeColorButton = instantiate(this.EnableAllCompositeModeButton);
          changeColorButton.setPosition(x + 90, y, 0.0);
          changeColorButton.setScale(0.5, 0.5, 0.5);
          changeColorButton.on(Button.EventType.CLICK, this.changeTextColor, this);
          changeColorButton.parent = buttonNode;
          labelComponent = changeColorButton.getComponentInChildren(Label);
          labelComponent.string = 'TextColor';
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          var HideButton = instantiate(this.EnableAllCompositeModeButton);
          HideButton.setPosition(x + 200, y, 0.0);
          HideButton.setScale(0.5, 0.5, 0.5);
          HideButton.on(Button.EventType.CLICK, this.hideUI, this);
          HideButton.parent = this.node.parent;
          labelComponent = HideButton.getComponentInChildren(Label);
          labelComponent.string = 'Hide UI';
          this.labelComponentList[this.labelComponentList.length] = labelComponent;
          this.hideButtonLabel = labelComponent; // misc

          y -= 40;

          for (var _i2 = 0; _i2 < this.strMisc.length; _i2++) {
            var _newNode = instantiate(this.compositeModeToggle);

            _newNode.setPosition(x, y - height * _i2, 0.0);

            _newNode.setScale(0.5, 0.5, 0.5);

            _newNode.parent = miscNode;

            var _textComponent = _newNode.getComponentInChildren(RichText);

            _textComponent.string = this.strMisc[_i2];
            this.textComponentList[this.textComponentList.length] = _textComponent;
            this.textContentList[this.textContentList.length] = _textComponent.string;

            var toggleComponent = _newNode.getComponent(Toggle);

            toggleComponent.isChecked = _i2 ? true : false;

            _newNode.on(Toggle.EventType.TOGGLE, _i2 ? this.toggleLightingWithAlbedo : this.toggleCSMColoration, this);

            this.miscModeToggleList[_i2] = _newNode;
          } // composite


          y -= 150;

          for (var _i3 = 0; _i3 < this.strComposite.length; _i3++) {
            var _newNode2 = _i3 ? instantiate(this.compositeModeToggle) : this.compositeModeToggle;

            _newNode2.setPosition(x, y - height * _i3, 0.0);

            _newNode2.setScale(0.5, 0.5, 0.5);

            _newNode2.parent = this.compositeModeToggle.parent;

            var _textComponent2 = _newNode2.getComponentInChildren(RichText);

            _textComponent2.string = this.strComposite[_i3];
            this.textComponentList[this.textComponentList.length] = _textComponent2;
            this.textContentList[this.textContentList.length] = _textComponent2.string;

            _newNode2.on(Toggle.EventType.TOGGLE, this.toggleCompositeMode, this);

            this.compositeModeToggleList[_i3] = _newNode2;
          }
        };

        _proto.isTextMatched = function isTextMatched(textUI, textDescription) {
          var tempText = new String(textUI);
          var findIndex = tempText.search('>');

          if (findIndex === -1) {
            return textUI === textDescription;
          } else {
            tempText = tempText.substr(findIndex + 1);
            tempText = tempText.substr(0, tempText.search('<'));
            return tempText === textDescription;
          }
        };

        _proto.toggleSingleMode = function toggleSingleMode(toggle) {
          var debugView = director.root.debugView;
          var textComponent = toggle.getComponentInChildren(RichText);

          for (var i = 0; i < this.strSingle.length; i++) {
            if (this.isTextMatched(textComponent.string, this.strSingle[i])) {
              debugView.singleMode = i;
            }
          }
        };

        _proto.toggleCompositeMode = function toggleCompositeMode(toggle) {
          var debugView = director.root.debugView;
          var textComponent = toggle.getComponentInChildren(RichText);

          for (var i = 0; i < this.strComposite.length; i++) {
            if (this.isTextMatched(textComponent.string, this.strComposite[i])) {
              debugView.enableCompositeMode(i, toggle.isChecked);
            }
          }
        };

        _proto.toggleLightingWithAlbedo = function toggleLightingWithAlbedo(toggle) {
          var debugView = director.root.debugView;
          debugView.lightingWithAlbedo = toggle.isChecked;
        };

        _proto.toggleCSMColoration = function toggleCSMColoration(toggle) {
          var debugView = director.root.debugView;
          debugView.csmLayerColoration = toggle.isChecked;
        };

        _proto.enableAllCompositeMode = function enableAllCompositeMode(button) {
          var debugView = director.root.debugView;
          debugView.enableAllCompositeMode(true);

          for (var i = 0; i < this.compositeModeToggleList.length; i++) {
            var _toggleComponent = this.compositeModeToggleList[i].getComponent(Toggle);

            _toggleComponent.isChecked = true;
          }

          var toggleComponent = this.miscModeToggleList[0].getComponent(Toggle);
          toggleComponent.isChecked = false;
          debugView.csmLayerColoration = false;
          toggleComponent = this.miscModeToggleList[1].getComponent(Toggle);
          toggleComponent.isChecked = true;
          debugView.lightingWithAlbedo = true;
        };

        _proto.hideUI = function hideUI(button) {
          var titleNode = this.node.getChildByName('Titles');
          var activeValue = !titleNode.active;
          this.singleModeToggleList[0].parent.active = activeValue;
          this.miscModeToggleList[0].parent.active = activeValue;
          this.compositeModeToggleList[0].parent.active = activeValue;
          this.EnableAllCompositeModeButton.parent.active = activeValue;
          titleNode.active = activeValue;
          this.hideButtonLabel.string = activeValue ? 'Hide UI' : 'Show UI';
        };

        _proto.changeTextColor = function changeTextColor(button) {
          this._currentColorIndex++;

          if (this._currentColorIndex >= this.strColor.length) {
            this._currentColorIndex = 0;
          }

          for (var i = 0; i < this.textComponentList.length; i++) {
            this.textComponentList[i].string = this.strColor[this._currentColorIndex] + this.textContentList[i] + '</color>';
          }

          for (var _i4 = 0; _i4 < this.labelComponentList.length; _i4++) {
            this.labelComponentList[_i4].color = this.color[this._currentColorIndex];
          }
        };

        _proto.onLoad = function onLoad() {};

        _proto.update = function update(deltaTime) {};

        return DebugViewRuntimeControl;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "compositeModeToggle", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "singleModeToggle", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "EnableAllCompositeModeButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/dweb_player.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, input, Input, BoxCollider, tween, Vec3, RigidBody, math, Component;

  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      input = module.input;
      Input = module.Input;
      BoxCollider = module.BoxCollider;
      tween = module.tween;
      Vec3 = module.Vec3;
      RigidBody = module.RigidBody;
      math = module.math;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;

      cclegacy._RF.push({}, "d0cb2is9vNM8qwXPEAa7Vcs", "dweb_player", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var dweb_player = exports('dweb_player', (_dec = ccclass('dwebPlayer'), _dec2 = property({
        type: Node
      }), _dec3 = property({
        type: Node
      }), _dec4 = property({
        type: Node
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(dweb_player, _Component);

        function dweb_player() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.keydown_w = false;
          _this.keydown_s = false;
          _this.keydown_a = false;
          _this.keydown_d = false;
          _this.mouse_x = 0;
          _this.mouse_y = 0;
          _this.mouse_left = false;
          _this.mouse_right = false;
          _this.cameraFallGround = false;

          _initializerDefineProperty(_this, "playerModel", _descriptor, _assertThisInitialized(_this));

          _this.playerAnima = null;

          _initializerDefineProperty(_this, "Bracket", _descriptor2, _assertThisInitialized(_this));

          _initializerDefineProperty(_this, "playerCamera", _descriptor3, _assertThisInitialized(_this));

          _this.Bracket_fall_x = 0;
          _this.player_runType = false;
          _this.cameraZoomMove = false;
          return _this;
        }

        var _proto = dweb_player.prototype;

        _proto.start = function start() {
          input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
          input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
          input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
          input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
          input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this); // this.playerAnima = this.playerModel!.getComponent(animation.AnimationController)

          this.Bracket = this.node.getChildByName('bracket');
          var collider = this.Bracket.getChildByName('cameraBox').getComponent(BoxCollider); // collider!.on('onTriggerEnter', this.onTriggerEnter, this)
          // collider!.on('onTriggerExit', this.onTriggerExit, this)
        };

        _proto.onTriggerEnter = function onTriggerEnter(event) {
          // console.log(event.type, event);
          console.log('camera落地'); // this.cameraFallGround = true
          // this.Bracket_fall_x = this.Bracket.eulerAngles.x
        };

        _proto.onTriggerExit = function onTriggerExit(event) {
          console.log('camera离开地面');
        };

        _proto.onMouseDown = function onMouseDown(event) {
          this.mouse_x = event.getLocationX();
          this.mouse_y = event.getLocationY();
          input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
          var mouse_btn = event.getButton();

          if (mouse_btn == 0) {
            this.mouse_left = true;
          }

          if (mouse_btn == 2) {
            this.mouse_right = true;
            this.bracketHoming();
          }

          if (this.mouse_left && this.mouse_right) {
            this.player_runType = true;
            this.playerRunAnime();
          }
        };

        _proto.onMouseWheel = function onMouseWheel(event) {
          var scrollY = event.getScrollY();

          if (scrollY > 0) {
            this.cameraZoom("near");
          } else {
            this.cameraZoom("far");
          }
        };

        _proto.cameraZoom = function cameraZoom(far_near) {
          var _this2 = this;

          console.log(far_near);

          if (this.cameraZoomMove == false) {
            this.cameraZoomMove = true;
            var dis = far_near == "far" ? 1.5 : -1.5;
            var now_cameraZ = this.playerCamera.position.z;

            if (now_cameraZ + dis > 6) {
              this.cameraZoomMove = false;
              return;
            }

            if (now_cameraZ + dis < 1.5) {
              this.cameraZoomMove = false;
              return;
            }

            tween(this.playerCamera).to(0.5, {
              position: new Vec3(this.playerCamera.position.x, this.playerCamera.position.y, this.playerCamera.position.z + dis)
            }, {
              onComplete: function onComplete() {
                _this2.cameraZoomMove = false;
              }
            }).start();
          }
        };

        _proto.onMouseMove = function onMouseMove(event) {
          var mouse_btn = event.getButton();

          if (mouse_btn == 0) {
            this.mouse_left = true;
          }

          if (mouse_btn == 2) {
            this.mouse_right = true;
          }

          this.cameraRotate(event.getLocationX(), event.getLocationY());
        };

        _proto.onMouseUp = function onMouseUp(event) {
          var mouse_btn = event.getButton();

          if (mouse_btn == 0) {
            this.mouse_left = false;
          }

          if (mouse_btn == 2) {
            this.mouse_right = false;
          }

          if (this.mouse_left == false && this.mouse_right == false) {
            input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
          }

          if (this.keydown_a == false && this.keydown_d == false && this.keydown_s == false && this.keydown_w == false) {
            this.player_runType = false;
            this.playerRunAnime();
          }
        };

        _proto.bracketHoming = function bracketHoming() {
          var world_rotation = this.Bracket.getWorldRotation();
          var parent_rotation_y = world_rotation.getEulerAngles(new Vec3(0, 0, 0)).y;
          var rotation_x = this.Bracket.eulerAngles.x;
          this.node.setRotationFromEuler(0, parent_rotation_y, 0);
          this.Bracket.setRotationFromEuler(rotation_x, 0, 0);
        };

        _proto.cameraRotate = function cameraRotate(x, y) {
          var rotation_y = this.Bracket.eulerAngles.y;
          var rotation_x = this.Bracket.eulerAngles.x;
          rotation_x += (y - this.mouse_y) * 1;
          rotation_y += (x - this.mouse_x) * -1;

          if (rotation_x > 90) {
            rotation_x = 90;
          }

          if (rotation_x < -90) {
            rotation_x = -90;
          }

          if (this.cameraFallGround) {
            var camera_rotation_x = this.playerCamera.eulerAngles.x;
            camera_rotation_x += y - this.mouse_y;

            if (camera_rotation_x < 0) {
              this.cameraFallGround = false;
              this.playerCamera.setRotationFromEuler(0, 180, 0);
              this.Bracket.setRotationFromEuler(rotation_x, rotation_y, 0);
              return;
            }

            if (camera_rotation_x > 90) {
              camera_rotation_x = 90;
            }

            this.playerCamera.setRotationFromEuler(camera_rotation_x, 180, 0);
            this.Bracket.setRotationFromEuler(this.Bracket_fall_x, rotation_y, 0);
          } else {
            this.Bracket.setRotationFromEuler(rotation_x, rotation_y, 0);
          }

          if (this.mouse_right) {
            this.bracketHoming();
          }

          this.mouse_x = x;
          this.mouse_y = y;
        };

        _proto.onKeyDown = function onKeyDown(event) {
          // console.log(event)
          var code = event.keyCode;
          var pos = this.node.getPosition();

          switch (code) {
            case 87:
              //按下w 向上移动
              if (this.player_runType == false) {
                this.player_runType = true;
                this.playerRunAnime();
              }

              this.keydown_w = true;
              break;

            case 83:
              //按下s 向上移动
              if (this.player_runType == false) {
                this.player_runType = true;
                this.playerRunAnime();
              }

              this.keydown_s = true;
              break;

            case 65:
              //按下a 向左移动
              if (this.player_runType == false) {
                this.player_runType = true;
                this.playerRunAnime();
              }

              this.keydown_a = true;
              break;

            case 68:
              //按下d 向右移动
              if (this.player_runType == false) {
                this.player_runType = true;
                this.playerRunAnime();
              }

              this.keydown_d = true;
              break;

            case 49:
              this.playerAnima.setValue('lightFit', true);
              break;

            case 50:
              this.playerAnima.setValue('huixuan', true);
              break;

            case 32:
              this.playerAnima.setValue('jump', true);
              this.node.getComponent(RigidBody).applyLocalImpulse(new Vec3(0, 3, 0)); // tween(this.node).to(0.3, { position: new Vec3(this.node.position.x, 3, this.node.position.z) }, {
              //   easing: "circOut",
              //   onStart: () => {
              //     this.jump = true
              //   }
              // }).start()

              break;
          }
        };

        _proto.onKeyUp = function onKeyUp(event) {
          var code = event.keyCode;

          switch (code) {
            case 87:
              this.keydown_w = false;

              if (this.player_runType) {
                if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_d || this.keydown_s) {
                  break;
                } else {
                  this.player_runType = false;
                  this.playerRunAnime();
                }
              }

              break;

            case 83:
              this.keydown_s = false;

              if (this.player_runType) {
                if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_d || this.keydown_w) {
                  break;
                } else {
                  this.player_runType = false;
                  this.playerRunAnime();
                }
              }

              break;

            case 65:
              this.keydown_a = false;

              if (this.player_runType) {
                if (this.mouse_left && this.mouse_right || this.keydown_w || this.keydown_d || this.keydown_s) {
                  break;
                } else {
                  this.player_runType = false;
                  this.playerRunAnime();
                }
              }

              break;

            case 68:
              this.keydown_d = false;

              if (this.player_runType) {
                if (this.mouse_left && this.mouse_right || this.keydown_a || this.keydown_w || this.keydown_s) {
                  break;
                } else {
                  this.player_runType = false;
                  this.playerRunAnime();
                }
              }

              break;
          }
        };

        _proto.playerRunAnime = function playerRunAnime() {// if (this.player_runType) {
          //   this.playerAnima!.setValue("walk", true)
          // } else {
          //   this.playerAnima!.setValue("walk", false)
          // }
        };

        _proto.getDirection = function getDirection(x, y, z, node) {
          var ret = new Vec3(x, y, z);
          math.Vec3.transformQuat(ret, ret, node.getRotation());
          return ret;
        };

        _proto.update = function update(deltaTime) {
          if (this.keydown_w || this.mouse_left && this.mouse_right) {
            this.playerModel.setRotationFromEuler(0, 0, 0);
            var pos = this.node.getPosition();
            math.Vec3.scaleAndAdd(pos, pos, this.getDirection(0, 0, -1, this.node), deltaTime * 5);
            this.node.setPosition(pos);
          }

          if (this.keydown_s) {
            this.playerModel.setRotationFromEuler(0, 180, 0);

            var _pos = this.node.getPosition();

            math.Vec3.scaleAndAdd(_pos, _pos, this.getDirection(0, 0, 1, this.node), deltaTime * 5);
            this.node.setPosition(_pos);
          }

          if (this.keydown_a) {
            this.playerModel.setRotationFromEuler(0, 90, 0);

            var _pos2 = this.node.getPosition();

            math.Vec3.scaleAndAdd(_pos2, _pos2, this.getDirection(-1, 0, 0, this.node), deltaTime * 5);
            this.node.setPosition(_pos2);
          }

          if (this.keydown_d) {
            this.playerModel.setRotationFromEuler(0, -90, 0);

            var _pos3 = this.node.getPosition();

            math.Vec3.scaleAndAdd(_pos3, _pos3, this.getDirection(1, 0, 0, this.node), deltaTime * 5);
            this.node.setPosition(_pos3);
          }
        };

        return dweb_player;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "playerModel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "Bracket", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "playerCamera", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./debug-view-runtime-control.ts', './dweb_player.ts', './tvmodel.ts', './windowEvent.ts'], function () {
  return {
    setters: [null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/tvmodel.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './windowEvent.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, MeshRenderer, Color, ImageAsset, Texture2D, Component, windowAddEvent;

  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      MeshRenderer = module.MeshRenderer;
      Color = module.Color;
      ImageAsset = module.ImageAsset;
      Texture2D = module.Texture2D;
      Component = module.Component;
    }, function (module) {
      windowAddEvent = module.windowAddEvent;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;

      cclegacy._RF.push({}, "a5713nEK75ML65Bce/q+WEx", "tvmodel", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var tvmodel = exports('tvmodel', (_dec = ccclass('tvmodel'), _dec2 = property({
        type: Node
      }), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(tvmodel, _Component);

        function tvmodel() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_this, "targetModel", _descriptor, _assertThisInitialized(_this));

          _this.modelMat = null;
          _this.offScreenCanvas = null;
          _this.offScreenCanvasCtx = null;
          return _this;
        }

        var _proto = tvmodel.prototype;

        _proto.start = function start() {
          windowAddEvent(this.node);
          this.modelMat = this.targetModel.getComponent(MeshRenderer).getRenderMaterial(0);
          this.modelMat.setProperty("albedo", new Color(255, 255, 255, 255));
          this.modelMat.setProperty("albedoMap", null);
          this.offScreenCanvas = new OffscreenCanvas(598, 550);
          this.offScreenCanvasCtx = this.offScreenCanvas.getContext('2d');
        };

        _proto.videoRender = function videoRender(imageData) {
          var _this$modelMat;

          this.offScreenCanvasCtx.putImageData(imageData, 0, 0);
          var imageAsset = new ImageAsset(this.offScreenCanvas.transferToImageBitmap());
          var texture = new Texture2D();
          texture.image = imageAsset;
          (_this$modelMat = this.modelMat) == null ? void 0 : _this$modelMat.setProperty("albedoMap", texture);
        };

        _proto.update = function update(deltaTime) {};

        return tvmodel;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "targetModel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/windowEvent.ts", ['cc', './tvmodel.ts'], function (exports) {
  var cclegacy, tvmodel;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      tvmodel = module.tvmodel;
    }],
    execute: function () {
      exports('windowAddEvent', windowAddEvent);

      cclegacy._RF.push({}, "0a749LwmHpAG7CfenYqg359", "windowEvent", undefined);

      var targetNode;

      function windowAddEvent(target) {
        console.log("------window监听添加message事件");
        window.addEventListener('message', function dosomething(event) {
          // console.log(event)
          // console.log(event.data)
          if (target) {
            targetNode = target;
            targetNode.getComponent(tvmodel).videoRender(event.data);
          }

          changeSomething(event.data);
        }, false);
      }

      function changeSomething(msg) {}

      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});