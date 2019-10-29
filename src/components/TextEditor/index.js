import React, { PureComponent } from "react"
import PropTypes from "prop-types"

import { EditorState, convertToRaw, ContentState } from "draft-js"
import { Editor } from "react-draft-wysiwyg"
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import { stateToHTML } from "draft-js-export-html"
import { stateFromHTML } from "draft-js-import-html"
// import htmlToDraft from "html-to-draftjs"
import { options } from "./options"
import { removeArrayDuplicates } from "../../helpers"
import { ClearButton } from "./Buttons"
import "./styles.css"

class TextEditor extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {}
  }

  static propTypes = {
    clearKey: PropTypes.string,
    html: PropTypes.string.isRequired,
    onChangeCallback: PropTypes.func,

    // import { Editor } from "react-draft-wysiwyg"
    onChange: PropTypes.func,
    onEditorStateChange: PropTypes.func,
    onContentStateChange: PropTypes.func,
    // initialContentState is deprecated
    initialContentState: PropTypes.object,
    defaultContentState: PropTypes.object,
    contentState: PropTypes.object,
    editorState: PropTypes.object,
    defaultEditorState: PropTypes.object,
    toolbarOnFocus: PropTypes.bool,
    spellCheck: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    stripPastedStyles: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    toolbar: PropTypes.object,
    toolbarCustomButtons: PropTypes.array,
    toolbarClassName: PropTypes.string,
    toolbarHidden: PropTypes.bool,
    locale: PropTypes.string,
    localization: PropTypes.object,
    editorClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    toolbarStyle: PropTypes.object,
    editorStyle: PropTypes.object,
    wrapperStyle: PropTypes.object,
    uploadCallback: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onTab: PropTypes.func,
    mention: PropTypes.object,
    hashtag: PropTypes.object,
    textAlignment: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    readOnly: PropTypes.bool,
    tabIndex: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    placeholder: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaLabel: PropTypes.string,
    ariaOwneeID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaActiveDescendantID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaAutoComplete: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaDescribedBy: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaExpanded: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaHasPopup: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    customBlockRenderFunc: PropTypes.func,
    wrapperId: PropTypes.number,
    customDecorators: PropTypes.array,
    editorRef: PropTypes.func
  }

  static defaultProps = {
    clearKey: "",
    mentions: [],
    suggestions: [],
    readOnly: false,
    toolbarHidden: false
  }

  componentWillMount() {
    this.getState(this.props)
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    this.getState(nextProps)
  }

  getState = props => {
    const {
      clearedOn,
      html,
      mentions,
      suggestions,
      readOnly,
      toolbarHidden
    } = props
    let editorState = this.htmlToEditorState(html)
    editorState = EditorState.moveSelectionToEnd(editorState)

    // const suggestions = Users.map(
    //   user =>
    //     (user = {
    //       text: user.username,
    //       value: user.username,
    //       url: `/profile/${user.id}`
    //     })
    // );
    this.setState({
      clearedOn,
      editorState,
      mentions,
      suggestions,
      readOnly,
      toolbarHidden
    })
  }

  componentWillUnmount() {}

  htmlToEditorState = html => {
    // const blocksFromHtml = htmlToDraft(html)
    // const { contentBlocks, entityMap } = blocksFromHtml
    // const contentState = ContentState.createFromBlockArray(blocksFromHtml)
    const contentState = stateFromHTML(html)

    return EditorState.createWithContent(contentState)
  }

  editorStateToHtml = editorState => {
    const EditorState = editorState ? editorState.getCurrentContent() : null
    const html = stateToHTML(EditorState)

    return html
  }

  handleEditorStateChange = editorState => {
    const { onChangeCallback } = this.props
    const html = this.editorStateToHtml(editorState)
    onChangeCallback(html)
  }

  getMentions = EditorState => {
    const mentions = []
    if (!EditorState) return mentions

    const entityMap = convertToRaw(EditorState).entityMap

    Object.values(entityMap).forEach(entity => {
      if (entity.type === "MENTION") {
        mentions.push(entity.data)
      }
    })

    return removeArrayDuplicates(
      mentions.map(m => parseInt(m.url.split("/")[2]))
    )
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value })

  orderOptions = values =>
    values.filter(v => v.isFixed).concat(values.filter(v => !v.isFixed))

  clearState = () =>
    this.setState({
      clearedOn: new Date(),
      editorState: EditorState.createEmpty()
    })

  render() {
    const {
      clearedOn,
      editorState,
      suggestions,
      readOnly,
      toolbarHidden
    } = this.state

    return (
      <Editor
        key={clearedOn}
        readOnly={readOnly}
        wrapperClassName="TextEditor Wrapper"
        editorClassName="Editor"
        toolbarClassName="Toolbar"
        defaultEditorState={editorState}
        // editorState={editorState}
        onEditorStateChange={editorState =>
          this.handleEditorStateChange(editorState)
        }
        onFocus={e => e.preventDefault()}
        // onBlur={(e, editorState) => {
        //   this.props.SetEditorState(
        //     draftToHtml(convertToRaw(editorState.getCurrentContent()))
        //   );
        // }}
        onTab={e => e.preventDefault()}
        blurInputOnSelect={false}
        toolbarHidden={toolbarHidden}
        toolbar={options}
        toolbarCustomButtons={[
          <ClearButton onClickCallback={this.clearState} />
        ]}
        mention={{
          separator: " ",
          trigger: "@",
          suggestions
        }}
        // toolbarOnFocus
        // stripPastedStyles="off"
        // spellCheck="off"
        // autoCapitalize="off"
        // autoComplete="off"
        // autoCorrect="off"
      />
    )
  }
}
export default TextEditor