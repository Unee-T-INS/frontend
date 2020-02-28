import React, { Component } from "react";
import PropTypes from "prop-types";
import FontIcon from "material-ui/FontIcon";
import { unitIconsStyle } from "../case-explorer/case-explorer.mui-styles";

const unitTypes = [
  { icon: "beach_access", categories: ["Life"] },
  { icon: "beach_access", categories: ["Health"] },
  { icon: "beach_access", categories: ["Marine"] },
  { icon: "beach_access", categories: ["Commercial"] },
  { icon: "beach_access", categories: ["Retail"] },
  {
    icon: "beach_access",
    categories: ["Others"]
  }
];

const iconDict = unitTypes.reduce((all, def) => {
  def.categories.forEach(cat => {
    all[cat] = def.icon;
  });
  return all;
}, {});

export default class UnitTypeIcon extends Component {
  render() {
    const { unitType } = this.props;
    const iconName =
      unitType && unitType !== "not_listed"
        ? iconDict[unitType]
        : "not_listed_location";
    return (
      <FontIcon
        className="material-icons"
        color="var(--bondi-blue)"
        style={unitIconsStyle}
      >
        {iconName}
      </FontIcon>
    );
  }
}

UnitTypeIcon.propTypes = {
  unitType: PropTypes.string
};
