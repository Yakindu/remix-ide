'use strict'
const Range = ace.acequire('ace/range').Range

const SERVER_URL = 'ws://localhost:5007'

class AceLanguageServerService {

    didOpen(editor) {
        this.socket.send(JSON.stringify({
            jsonrpc: "2.0",
            method: "textDocument/didOpen",
            params: {
                textDocument: {
                    uri: "inmemory://demo/model.sol",
                    languageId: "solidity-ide",
                    version: 1,
                    text: editor.getValue()
                }
            }
        }))
    }

    completions(editor, callback) {
        this.didOpen(editor)
        this.socket.onmessage = (msg) => this.completionsCallback(msg, callback)

        var completionRequest = {
            jsonrpc: "2.0",
            id: 4,
            method: "textDocument/completion",
            params: {
                textDocument: {
                    uri: "inmemory://demo/model.sol",
                },
                position: {
                    line: editor.getCursorPosition().row,
                    character: editor.getCursorPosition().column
                },
                context: {
                    triggerKind: 1
                }
            }
        }
        this.socket.send(JSON.stringify(completionRequest))
    }

    completionsCallback(msg, callback) {
        var results = JSON.parse(msg.data).result.items.forEach(item => {
            callback(null, [
                {
                    name: item.label,
                    value: item.label,
                    score: 100,
                    meta: 'yakindu'
                }])
        });
    }

    gotoDefinition(editor, data) {
        this.didOpen(editor)
        this.socket.onmessage = (msg) => this.gotoDefinitionCallback(editor, msg)

        const gotoDefinitionRequest = {
            jsonrpc: "2.0",
            id: 14,
            method: "textDocument/definition",
            params: {
                textDocument: {
                    uri: "inmemory://demo/model.sol",
                },
                position: {
                    line: data.position.row,
                    character: data.position.column
                }
            }
        }
        this.socket.send(JSON.stringify(gotoDefinitionRequest))
    }

    gotoDefinitionCallback(editor, msg) {
        var textEdit = JSON.parse(msg.data).result.forEach(item => {
            var range = new Range(
                item.range.start.line,
                item.range.start.character,
                item.range.end.line,
                item.range.end.character
            )
            editor.selection.setRange(range)
        })
    }

    format(editor) {
        this.didOpen(editor)
        this.socket.onmessage = (msg) => this.formatCallBack(editor, msg)

        const formatRequest = {
            jsonrpc: "2.0",
            id: 4,
            method: "textDocument/formatting",
            params: {
                textDocument: {
                    uri: "inmemory://demo/model.sol"
                },
                options: {
                    tabsize: 4
                }
            }
        }
        this.socket.send(JSON.stringify(formatRequest))
    }

    formatCallBack(editor, msg) {
        var originalText = editor.getValue()
        var formattedText = ""
        var offset = 0
        JSON.parse(msg.data).result.forEach(textEdit => {

            var startPosition = {
                row: textEdit.range.start.line,
                column: textEdit.range.start.character
            }

            var endPosition = {
                row: textEdit.range.end.line,
                column: textEdit.range.end.character
            }

            var startOffset = editor.session.doc.positionToIndex(startPosition)
            formattedText += originalText.substr(offset, startOffset - offset) + textEdit.newText
            offset = editor.session.doc.positionToIndex(endPosition)

        })

        editor.setValue(formattedText + originalText.substr(offset))
    }

    init(editor) {
        this.socket = new WebSocket(SERVER_URL)
        this.socket.onmessage = function (e) { console.log(e.data); };
        this.socket.onopen = () =>
            this.socket.send(`
        {  
            "jsonrpc":"2.0",
            "id":0,
            "method":"initialize",
            "params":{  
            "rootPath":null,
            "rootUri":null,
            "capabilities":{  
                "workspace":{  
                    "applyEdit":true,
                    "workspaceEdit":{  
                        "documentChanges":true
                    },
                    "didChangeConfiguration":{  
                        "dynamicRegistration":true
                    },
                    "didChangeWatchedFiles":{  
                        "dynamicRegistration":true
                    },
                    "symbol":{  
                        "dynamicRegistration":true,
                        "symbolKind":{  
                        "valueSet":[  
                            1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
                            ]
                        }
                    },
                    "executeCommand":{  
                        "dynamicRegistration":true
                    },
                    "workspaceFolders":true
                },
                "textDocument":{  
                    "publishDiagnostics":{  
                        "relatedInformation":true
                    },
                    "synchronization":{  
                        "dynamicRegistration":true,
                        "willSave":true,
                        "willSaveWaitUntil":true,
                        "didSave":true
                    },
                    "completion":{  
                        "dynamicRegistration":true,
                        "contextSupport":true,
                        "completionItem":{  
                        "snippetSupport":true,
                        "commitCharactersSupport":true,
                        "documentationFormat":[  
                            "markdown",
                            "plaintext"
                        ],
                        "deprecatedSupport":true,
                        "preselectSupport":true
                        },
                        "completionItemKind":{  
                        "valueSet":[  
                            1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25
                          ]
                        }
                    },
                    "hover":{  
                        "dynamicRegistration":true,
                        "contentFormat":[  
                        "markdown",
                        "plaintext"
                        ]
                    },
                    "signatureHelp":{  
                        "dynamicRegistration":true,
                        "signatureInformation":{  
                        "documentationFormat":[  
                            "markdown",
                            "plaintext"
                        ]
                        }
                    },
                    "definition":{  
                        "dynamicRegistration":true
                    },
                    "references":{  
                        "dynamicRegistration":true
                    },
                    "documentHighlight":{  
                        "dynamicRegistration":true
                    },
                    "documentSymbol":{  
                        "dynamicRegistration":true,
                        "symbolKind":{  
                        "valueSet":[  
                            1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26
                         ]
                        },
                        "hierarchicalDocumentSymbolSupport":true
                    },
                    "codeAction":{  
                        "dynamicRegistration":true,
                        "codeActionLiteralSupport":{  
                        "codeActionKind":{  
                            "valueSet":[  
                                "",
                                "quickfix",
                                "refactor",
                                "refactor.extract",
                                "refactor.inline",
                                "refactor.rewrite",
                                "source",
                                "source.organizeImports"
                            ]
                        }
                        }
                    },
                    "codeLens":{  
                        "dynamicRegistration":true
                    },
                    "formatting":{  
                        "dynamicRegistration":true
                    },
                    "rangeFormatting":{  
                        "dynamicRegistration":true
                    },
                    "onTypeFormatting":{  
                        "dynamicRegistration":true
                    },
                    "rename":{  
                        "dynamicRegistration":true
                    },
                    "documentLink":{  
                        "dynamicRegistration":true
                    },
                    "typeDefinition":{  
                        "dynamicRegistration":true
                    },
                    "implementation":{  
                        "dynamicRegistration":true
                    },
                    "colorProvider":{  
                        "dynamicRegistration":true
                    },
                    "foldingRange":{  
                        "dynamicRegistration":true,
                        "rangeLimit":5000,
                        "lineFoldingOnly":true
                    }
                }
            },
            "trace":"off",
            "workspaceFolders":null
            }
        }
        `);
    }
}

module.exports = AceLanguageServerService
