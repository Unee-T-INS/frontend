// @flow
import { Meteor } from "meteor/meteor";
import * as React from "react";
import { createContainer } from "meteor/react-meteor-data";
import { connect } from "react-redux";
import CircularProgress from "material-ui/CircularProgress";
import IconButton from "material-ui/IconButton";
import FontIcon from "material-ui/FontIcon";
import { isEqual } from "lodash";
import AutoComplete from "material-ui/AutoComplete";

import {
  removeCleared,
  removeFromUnit
} from "../../state/actions/unit-invite.actions";
import { editUnitMetaData } from "../../state/actions/unit-meta-data.actions";
import { infoItemMembers, infoItemLabel } from "../util/static-info-rendering";
import { placeholderEmailMatcher } from "../../util/matchers";
import { userInfoItem } from "../../util/user";
import ConfirmationDialog from "../dialogs/confirmation-dialog";
import ErrorDialog from "../dialogs/error-dialog";
import EditableItem from "../components/editable-item";
import { countryListItems } from "../util/common-renderers";
import countries from "iso-3166-1-codes";
import { unitTypes, statusOfPolicies } from "../../api/unit-meta-data";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import {
  textInputFloatingLabelStyle,
  textInputUnderlineFocusStyle
} from "../components/form-controls.mui-styles";
import FloorPlanUploader from "../components/floor-plan-uploader";

type UnitUser = {
  login: string,
  _id: string,
  email: string,
  name?: string
};

type Props = {
  unitItem: {
    id: number,
    name: string,
    classification: string,
    description: string
  },
  metaData: {
    _id: string,
    displayName: string,
    unitType: string,
    moreInfo: string,
    streetAddress: string,
    country: string,
    state: string,
    city: string,
    zipCode: string,
    floorPlanUrls?: Array<{
      url: string,
      disabled?: boolean
    }>
  },
  unitUsers: Array<UnitUser>,
  currentUser: {
    _id: string,
    bugzillaCreds: {
      login: string
    }
  },
  removalProcesses: Array<{
    userEmail: string,
    unitBzId: number,
    complete: boolean,
    pending: boolean,
    error: ?{
      message: string
    }
  }>,
  isOwner: boolean,
  isEditing: boolean,
  dispatch: (action: any) => void,
  registerSaveHandler: (handler: () => void) => void,
  floorPlanUploadProcess: ?{
    unitMongoId: string,
    preview: string,
    percent: number,
    error?: {}
  }
};

type State = {
  userToRemove: ?UnitUser,
  showRemovalConfirmation: boolean,
  unitName: string,
  moreInfo: string,
  streetAddress: string,
  city: string,
  state: string,
  country: string,
  zipCode: string,
  countrySearchText: string,
  countryValidWarning: ?string,
  unitType: ?{
    name: string
  }
};

class UnitOverviewTab extends React.Component<Props, State> {
  state = {
    userToRemove: null,
    showRemovalConfirmation: false,
    countrySearchText: "",
    countryValidWarning: null,
    unitType: null,
    unitName: "",
    moreInfo: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    statusOfPolicy: ""
  };
  renderEditableField = ({ label, stateVar, isEditing }) => (
    <EditableItem
      label={label}
      disabled={!isEditing}
      underlineShow={isEditing}
      currentValue={this.state[stateVar] || (isEditing ? "" : "---")}
      onEdit={val => this.setState({ [stateVar]: val })}
    />
  );

  getOngoingRemoval(props, state) {
    const { userToRemove } = state;
    const { unitItem, removalProcesses } = props;

    return userToRemove
      ? removalProcesses.find(
          p => p.userEmail === userToRemove.email && p.unitBzId === unitItem.id
        )
      : null;
  }

  setEditableStateFromProps = props => {
    const { metaData, unitItem } = props;
    const unitName = metaData.displayName || unitItem.name;
    const moreInfo = metaData.moreInfo || unitItem.description;
    const { streetAddress, city, state, country, zipCode, unitType } = metaData;

    const unitTypeDef = unitTypes.find(type => type.name === unitType);
    this.setState({
      countrySearchText: country,
      unitType: unitTypeDef,
      unitName,
      moreInfo,
      streetAddress,
      city,
      state,
      country,
      zipCode
    });
  };

  componentDidMount() {
    this.props.registerSaveHandler(this.handleSave);
    this.setEditableStateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps: Props, nextState: State) {
    const prevOngoingRemoval = this.getOngoingRemoval(this.props, this.state);
    const nextOngoingRemoval = this.getOngoingRemoval(nextProps, nextState);
    if (
      prevOngoingRemoval &&
      nextOngoingRemoval &&
      nextOngoingRemoval.complete
    ) {
      this.handleRemovalClearRequested();
    }

    if (
      !isEqual(nextProps.unitItem, this.props.unitItem) ||
      !isEqual(nextProps.metaData, this.props.metaData) ||
      (!nextProps.isEditing && this.props.isEditing)
    ) {
      this.setEditableStateFromProps(nextProps);
    }
  }
  handleRemovalClearRequested = () => {
    const ongoingRemoval = this.getOngoingRemoval(this.props, this.state);
    if (ongoingRemoval) {
      this.props.dispatch(
        removeCleared(ongoingRemoval.userEmail, ongoingRemoval.unitBzId)
      );
    }
  };
  handleSave = () => {
    const { dispatch, metaData } = this.props;
    const {
      unitName,
      moreInfo,
      streetAddress,
      city,
      state,
      country,
      zipCode,
      unitType
    } = this.state;
    dispatch(
      editUnitMetaData(metaData._id, {
        displayName: unitName,
        unitType: unitType ? unitType.name : metaData.unitType,
        moreInfo,
        streetAddress,
        city,
        state,
        country,
        zipCode
      })
    );
  };
  render() {
    const {
      unitItem,
      metaData,
      unitUsers,
      isOwner,
      currentUser,
      dispatch,
      isEditing
    } = this.props;
    const {
      showRemovalConfirmation,
      userToRemove,
      countrySearchText,
      country,
      countryValidWarning,
      unitType,
      statusOfPolicy
    } = this.state;
    const ongoingRemoval = this.getOngoingRemoval(this.props, this.state);
    const unitName = metaData.displayName || unitItem.name;
    const currLoginName = currentUser.bugzillaCreds.login;
    return (
      <div className="flex-grow bg-very-light-gray pb5">
        <div className="bg-white card-shadow-1 pa3">
          <div>
            {this.renderEditableField({
              label: "Policy Number",
              stateVar: "unitName",
              isEditing
            })}
          </div>
          {/* <div className='mt2'>
              {infoItemMembers('Property Group', unitItem.classification)}
            </div> */}
          <div>
            {isEditing ? (
              <SelectField
                value={unitType}
                floatingLabelText="Policy Type"
                floatingLabelStyle={textInputFloatingLabelStyle}
                underlineFocusStyle={textInputUnderlineFocusStyle}
                fullWidth
                onChange={(evt, idx, val) => {
                  this.setState({
                    unitType: val
                  });
                }}
              >
                {unitTypes.map(type => (
                  <MenuItem
                    key={type.name}
                    value={type}
                    primaryText={type.name}
                  />
                ))}
              </SelectField>
            ) : (
              <div className="mt3">
                {infoItemMembers("Policy Type", metaData.unitType)}
              </div>
            )}
          </div>
          <div>
            {this.renderEditableField({
              label: "Name of Product",
              stateVar: "moreInfo",
              isEditing
            })}
          </div>
          <div>
            {isEditing ? (
              <SelectField
                value={statusOfPolicy}
                floatingLabelText="Status of Policy"
                floatingLabelStyle={textInputFloatingLabelStyle}
                underlineFocusStyle={textInputUnderlineFocusStyle}
                fullWidth
                onChange={(evt, idx, val) => {
                  this.setState({
                    statusOfPolicy: val
                  });
                }}
              >
                {statusOfPolicies.map(status => (
                  <MenuItem
                    key={status.name}
                    value={status}
                    primaryText={status.name}
                  />
                ))}
              </SelectField>
            ) : (
              <div className="mt3">
                {infoItemMembers("Status of Policy", metaData.status)}
              </div>
            )}
          </div>
        </div>
        <div className="mt2 bg-white card-shadow-1 pa3">
          {infoItemLabel("Policy Documents")}
          <div className="mt2">
            <FloorPlanUploader unitMetaData={metaData} />
          </div>
        </div>
        <div className="mt2 bg-white card-shadow-1 pa3">
          <div className="fw5 silver lh-title">DETAILS</div>
          <div>
            {this.renderEditableField({
              label: "Premium",
              stateVar: "streetAddress",
              isEditing
            })}
          </div>
          <div>
            {this.renderEditableField({
              label: "From to",
              stateVar: "city",
              isEditing
            })}
          </div>
          <div>
            {isEditing ? (
              <div>
                {this.renderEditableField({
                  label: "Insurer",
                  stateVar: "city",
                  isEditing
                })}
              </div>
            ) : (
              <div className="mt3">
                {infoItemMembers("Insurer", metaData.country)}
              </div>
            )}
          </div>
          <div className="flex mt2">
            <div className="flex-grow">
              {this.renderEditableField({
                label: "Additional Comment(s)",
                stateVar: "state",
                isEditing
              })}
            </div>
            {/* <div className='flex-grow'>
                {this.renderEditableField({
                  label: 'Zip / Postal code',
                  stateVar: 'zipCode',
                  isEditing
                })}
              </div> */}
          </div>
        </div>
        <div className="mt2 bg-white card-shadow-1 pa3">
          <div className="fw5 silver lh-title">PEOPLE</div>
          {ongoingRemoval && ongoingRemoval.pending ? (
            <div className="flex items-center justify-center pv4">
              <CircularProgress size={70} thickness={5} />
            </div>
          ) : (
            unitUsers
              .filter(user => !placeholderEmailMatcher(user.login))
              .sort((a, b) =>
                a._id === currentUser._id // Sorting for the curr user to appear first
                  ? 1
                  : b._id === currentUser._id
                  ? -1
                  : 0
              )
              .map(user => (
                <div className="mt1" key={user.login}>
                  {userInfoItem(
                    user,
                    isOwner &&
                      currLoginName !== user.login &&
                      (user =>
                        !!user.email &&
                        isEditing && (
                          <IconButton
                            onClick={() =>
                              this.setState({
                                userToRemove: user,
                                showRemovalConfirmation: true
                              })
                            }
                          >
                            <FontIcon className="material-icons" color="#999">
                              close
                            </FontIcon>
                          </IconButton>
                        ))
                  )}
                </div>
              ))
          )}
        </div>
        <ConfirmationDialog
          show={!!showRemovalConfirmation}
          onConfirm={() => {
            this.setState({ showRemovalConfirmation: false });
            if (userToRemove) {
              dispatch(removeFromUnit(userToRemove.email, unitItem.id));
            }
          }}
          onCancel={() =>
            this.setState({
              userToRemove: null,
              showRemovalConfirmation: false
            })
          }
          confirmLabel="Remove User"
          title={
            userToRemove ? (
              <div>
                <div className="tc fw3">
                  Are you sure you want to remove
                  <span className="bondi-blue">
                    {" "}
                    {userToRemove.name || userToRemove.login.split("@")[0]}{" "}
                  </span>
                  from the property
                  <span className="b"> {unitName}</span>?
                </div>
              </div>
            ) : (
              ""
            )
          }
        >
          <div className="tc lh-copy">
            This person will not be able to create new cases, post any comments
            or receive any notifications for this property.
          </div>
        </ConfirmationDialog>
        <ErrorDialog
          show={!!(ongoingRemoval && ongoingRemoval.error)}
          text={
            ongoingRemoval && ongoingRemoval.error
              ? ongoingRemoval.error.message
              : "Error"
          }
          onDismissed={this.handleRemovalClearRequested}
        />
      </div>
    );
  }
}

export default connect(
  ({ unitUserRemovalState, unitFloorPlanUploadState }, props: Props) => {
    const mongoId = props.metaData && props.metaData._id;
    const floorPlanUploadProcess =
      mongoId &&
      unitFloorPlanUploadState.find(proc => proc.unitMongoId === mongoId);
    return {
      removalProcesses: unitUserRemovalState,
      floorPlanUploadProcess
    };
  }
)(
  createContainer(
    () => ({
      currentUser: Meteor.user()
    }),
    UnitOverviewTab
  )
);
