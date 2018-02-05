import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import * as Survey from "survey-angular";
import * as _ from "lodash";
declare var noUiSlider: any;
declare var $: any;
declare var Sortable: any;
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  sliderWidget: any;
  surveyModel: any;
  questionnaire: any;
  questions: any;
  datepicker: any;
  iwidget: any;
  pwidget: any;
  constructor(public navCtrl: NavController) {}
  ionViewDidEnter() {
    var questions = {
      questions: [
        {
          type: "comment",
          name: "190_239",
          title: "Eneter your comments",
          isRequired: false,
          validators: []
        },
        {
          type: "sortablelist",
          name: "lifepriopity",
          title: "Life Priorities ",
          isRequired: true,
          choices: ["family", "work", "pets", "travels", "games"]
        },
        {
          type: "matrix",
          name: "Quality",
          title:
            "Please indicate if you agree or disagree with the following statements",
          columns: [
            {
              value: 1,
              text: "Strongly Disagree"
            },
            {
              value: 2,
              text: "Disagree"
            },
            {
              value: 3,
              text: "Neutral"
            },
            {
              value: 4,
              text: "Agree"
            }
          ],
          rows: [
            {
              value: "affordable",
              text: "Product is affordable"
            },
            {
              value: "does what it claims",
              text: "Product does what it claims"
            },
            {
              value: "better then others",
              text: "Product is better than other products on the market"
            },
            {
              value: "easy to use",
              text: "Product is easy to use"
            }
          ]
        },
        {
          inputType: "date",
          isRequired: false,
          name: "282_340",
          title: "Select date from a range.",
          type: "text",
          validators: []
        },
        {
          type: "checkbox",
          name: "156_190",
          title: "Test",
          isRequired: false,
          renderAs: "nouislider"
        }
      ],
      answeredOptions: {},
      questionnaireId: 5,
      name: "DM",
      description: "DM",
      status: "COMPLETED",
      unreadCommentsCount: 0
    };
    this.questionnaire = questions;
    this.questions = { questions: this.questionnaire["questions"] };

    this.createPriority();
    Survey.CustomWidgetCollection.Instance.addCustomWidget(
      this.pwidget,
      "customtype"
    );

    this.createSlider();

    Survey.CustomWidgetCollection.Instance.addCustomWidget(this.sliderWidget);
    Survey.JsonObject.metaData.addProperty("datepicker", {
      name: "dateFormat",
      default: "mm/dd/yy",
      choices: [
        "mm/dd/yy",
        "yy-mm-dd",
        "d M, y",
        "d MM, y",
        "DD, d MM, yy",
        "'day' d 'of' MM 'in the year' yy"
      ]
    });

    Survey.Survey.cssType = "bootstrap";
    Survey.defaultBootstrapCss.navigationButton = "btn btn-primary";
    Survey.defaultBootstrapCss.navigation.complete = "complete-btn";
    Survey.defaultBootstrapCss.row = "row question-box";
    Survey.defaultBootstrapCss.multipletext.root = "multipletext";
    Survey.defaultBootstrapCss.saveData.error =
      "error-msg-box font-weight-mid header-padding-tiny";

    this.createDatePicker();
    this.createiCheck();
    Survey.CustomWidgetCollection.Instance.addCustomWidget(this.iwidget);
    this.surveyModel = new Survey.ReactSurveyModel(this.questions);
    this.surveyModel.questionErrorLocation = "top";
    this.surveyModel.onAfterRenderSurvey.add(function(sender, options) {
      let trcount;
      const $inputstr = $("table tbody tr");
      _.each($inputstr, function(el) {
        trcount = trcount || 1;
        const tdel = $(el).find("td:not(:first) label input");
        let icount;
        _.each(tdel, function(el) {
          icount = icount || 1;

          $(el).attr("id", "mtr" + trcount + icount);
          icount++;
        });
        trcount++;
      });

      const $inputs = $("table tbody tr td:not(:first) label input");
      $("table tbody tr td:first").addClass("captionText");
      let id;
      _.each($inputs, function(el) {
        id = id || 0;
        id++;
        const $val = $(el).val();
        const html = '<span class="matrix-vert"></span>';
        $(el).after(html);
      });
    });
    Survey.CustomWidgetCollection.Instance.addCustomWidget(this.datepicker);
    if (document.getElementById("surveyElement")) {
      Survey.SurveyNG.render("surveyElement", {
        model: this.surveyModel
      });
    }
  }

  createPriority() {
    this.pwidget = {
      name: "sortablelist",
      title: "Sortable list",
      iconName: "icon-sortablelist",
      widgetIsLoaded: function() {
        return typeof Sortable != "undefined";
      },
      defaultJSON: { choices: ["Item 1", "Item 2", "Item 3"] },
      areaStyle: "border: 1px solid #1ab394; width:100%; min-height:50px",
      itemStyle: "background-color:#1ab394;color:#fff;margin:5px;padding:10px;",
      isFit: function(question) {
        return question.getType() === "sortablelist";
      },
      htmlTemplate: "<div></div>",
      activatedByChanged: function(activatedBy) {
        Survey.JsonObject.metaData.addClass(
          "sortablelist",
          [
            { name: "hasOther", visible: false },
            { name: "storeOthersAsComment", visible: false }
          ],
          null,
          "checkbox"
        );
        Survey.JsonObject.metaData.addProperty("sortablelist", {
          name: "emptyText",
          default: "Move items here."
        });
      },
      afterRender: function(question, el) {
        var rootWidget = this;
        el.style.width = "100%";
        var resultEl = document.createElement("div");
        var emptyEl = document.createElement("span");
        var sourceEl = document.createElement("div");
        resultEl.style.cssText = rootWidget.areaStyle;
        emptyEl.innerHTML = question.emptyText;
        resultEl.appendChild(emptyEl);
        sourceEl.style.cssText = rootWidget.areaStyle;
        sourceEl.style.marginTop = "10px";
        el.appendChild(resultEl);
        el.appendChild(sourceEl);
        var hasValueInResults = function(val) {
          var res = question.value;
          if (!Array.isArray(res)) return false;
          for (var i = 0; i < res.length; i++) {
            if (res[i] == val) return true;
          }
          return false;
        };
        var isUpdatingQuestionValue = false;
        var updateValueHandler = function() {
          if (isUpdatingQuestionValue) return;
          resultEl.innerHTML = "";
          resultEl.appendChild(emptyEl);
          sourceEl.innerHTML = "";
          var wasInResults = false;
          question.activeChoices.forEach(function(choice) {
            var inResutls = hasValueInResults(choice.value);
            wasInResults = wasInResults || inResutls;
            var srcEl = inResutls ? resultEl : sourceEl;
            var newEl = document.createElement("div");
            newEl.innerHTML =
              "<div style='" +
              rootWidget.itemStyle +
              "'>" +
              choice.text +
              "</div>";
            newEl.dataset["value"] = choice.value;
            srcEl.appendChild(newEl);
          });
          emptyEl.style.display = wasInResults ? "none" : "";
        };
        question.resultEl = Sortable.create(resultEl, {
          animation: 150,
          group: question.name,
          onSort: function(evt) {
            var result = [];
            if (resultEl.children.length === 1) {
              emptyEl.style.display = "";
            } else {
              emptyEl.style.display = "none";
              for (var i = 0; i < resultEl.children.length; i++) {
                if (typeof resultEl.children[i].dataset.value === "undefined")
                  continue;
                result.push(resultEl.children[i].dataset.value);
              }
            }
            isUpdatingQuestionValue = true;
            question.value = result;
            isUpdatingQuestionValue = false;
          }
        });
        question.sourceEl = Sortable.create(sourceEl, {
          animation: 150,
          group: question.name
        });
        question.valueChangedCallback = updateValueHandler;
        updateValueHandler();
      },
      willUnmount: function(question, el) {
        question.resultEl.destroy();
        question.sourceEl.destroy();
      }
    };
  }

  sendDataToServer(survey) {
    var resultAsString = JSON.stringify(survey.data);
    alert(resultAsString); //send Ajax request to your web server.
  }

  createSlider() {
    const self = this;
    this.sliderWidget = {
      name: "nouislider",
      htmlTemplate: '<div id="slider"></div>',
      isFit: function(question) {
        return question.name === "156_190";
      },
      afterRender: (question, el) => {
        const slider = el;
        const startPoint = "10";
        noUiSlider.create(slider, {
          start: 0,
          connect: [true, false],
          step: 5,
          pips: {
            mode: "steps",
            stepped: true
          },
          range: {
            min: 0,
            max: 25
          },
          tooltips: [true]
        });
        slider.noUiSlider.on("set", function() {
          question.value = slider.noUiSlider.get();
        });
      },
      willUnmount: function(question, el) {
        const slider = el.querySelector("#slider");
        slider.noUiSlider.destroy();
      }
    };
  }

  createDatePicker() {
    this.datepicker = {
      name: "datepicker",
      htmlTemplate:
        '<input class="widget-datepicker form-control" type="text" style="width: 12%;">',
      isFit: function(question) {
        return question.inputType === "date";
      },
      afterRender: function(question, el) {
        const $el = $(".widget-datepicker");

        const widget = $el.datepicker({
          changeMonth: true,
          changeYear: true,
          showButtonPanel: true,
          dateFormat: "m/d/yy"
        });

        question.valueChangedCallback = function() {
          $("#" + question.name).val(question.value);
        };

        question.valueChangedCallback();
      },
      willUnmount: function(question, el) {
        $(el)
          .find(".widget-datepicker")
          .datepicker("destroy");
      }
    };
  }
  createiCheck() {
    this.iwidget = {
      name: "icheck",
      isDefaultRender: true,
      htmlTemplate: '<div id="ichk-matrix"></div>',
      isFit: function(question) {
        return question.getType() === "matrix";
      },
      afterRender: function(question, el) {
        const $el = $("#ichk-matrix");
        $el.find(".table").addClass("ichk-matrix");
        $(el)
          .find("input")
          .iCheck({
            checkboxClass: "icheckbox_futurico",
            radioClass: "icheckbox_futurico",
            increaseArea: "20%" // optional
          });

        $(el)
          .find("input")
          .on("ifChecked", function(event) {
            question.generatedVisibleRows.forEach(function(row, index, rows) {
              if (row.fullName === event.target.name) {
                row.value = event.target.value;
              }
            });
          });

        var select = function() {
          question.generatedVisibleRows.forEach(function(row, index, rows) {
            if (row.value) {
              $(el)
                .find(
                  "input[name='" + row.fullName + "'][value=" + row.value + "]"
                )
                .iCheck("check");
              const elem = $(el).find(
                "input[name='" + row.fullName + "'][value=" + row.value + "]"
              );
              const id = $(elem)[0].id;
              const rowToEdit = $("#" + id).closest("tr");
              const selectedOption = id.substr(id.length - 1);
              const editedTd = $(rowToEdit).find("td:not(:first) label");
              _.each(editedTd, function(el, index) {
                if (index < parseInt(selectedOption)) {
                  $(el).removeClass("highlightPrevious");
                  $(el).addClass("highlightPrevious");
                } else {
                  $(el).removeClass("highlightPrevious");
                }
              });
            }
          });
        };

        question.valueChangedCallback = select;
        select();
      }
    };
  }
}
