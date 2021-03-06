import { Migrations } from 'meteor/percolate:migrations'
import UnitRolesData, { defaultRoleVisibility } from '../api/unit-roles-data'

Migrations.add({
  version: 13,
  up: () => {
    UnitRolesData.find().forEach(roleDoc => {
      let anyChange
      roleDoc.members.forEach(mem => {
        if (!mem.roleVisibility) {
          mem.roleVisibility = { ...defaultRoleVisibility }
          mem.roleVisibilitySetByDefault = true
          anyChange = true
        }
      })

      if (anyChange) {
        UnitRolesData.rawCollection().save(roleDoc)
      }
    })
  },
  down: () => {
    UnitRolesData.find().forEach(roleDoc => {
      let anyChange
      roleDoc.members.forEach(mem => {
        if (mem.roleVisibilitySetByDefault) {
          delete mem.roleVisibility
          delete mem.roleVisibilitySetByDefault
          anyChange = true
        }
      })

      if (anyChange) {
        UnitRolesData.rawCollection().save(roleDoc)
      }
    })
  }
})
