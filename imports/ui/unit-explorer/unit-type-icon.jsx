import React, { Component } from "react";
import PropTypes from "prop-types";
import FontIcon from "material-ui/FontIcon";
import { unitIconsStyle } from "../case-explorer/case-explorer.mui-styles";

const unitTypes = [
  { icon: "home", categories: ["Life"] },
  { icon: "local_hospital", categories: ["Health"] },
  { icon: "local_shipping", categories: ["Marine"] },
  { icon: "shopping_cart", categories: ["Commercial"] },
  { icon: "business", categories: ["Retail"] },
  {
    icon: "not_listed_location",
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
