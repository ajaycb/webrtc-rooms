import EventEmitter from "events";

class Layout {
  constructor(
    room,
    layout_data,
    tiled = false,
    spotlight = null,
    sidebar = null
  ) {
    Object.assign(this, { room, layout_data, type, tiled, spotlight, sidebar });
    this.sidebar = this.sidebar || new Sidebar(this);
  }
  tiles() {
    return [spotlight, ...sidebar.sections];
  }
  setSpotlight(type, from, identifier, extras = {}) {
    this.spotlight = new Section(this, type, from, identifier, extras);
  }
  addToSideBar(type, from, identifier, extras = {}) {
    this.sidebar.add(new Section(this, type, from, identifier, extras));
  }
}
class Sidebar {
  constructor(layout, gravity = "top_right", size = "medium", sections = []) {
    Object.assign(this, { layout, gravity, size, sections });
  }
  add(section) {
    let i = this.sections.findIndex((s) => s.uniq_id === section.uniq_id);
    if (i !== -1) {
      this.removeAt(i);
    }

    this.sections.push(section);
  }
  removeAt(i) {
    this.sections.splice(i, 1);
  }
}
class Section {
  constructor(layout, type, from, identifier, extras) {
    Object.assign(this, { layout, type, from, identifier, extras });
    this.uniq_id = `${user}-${type}-${identifier}`;
  }
  isLocal() {
    return this.layout.room.user.id === from;
  }
}

class LayoutData extends EventEmitter {
  constructor(room) {
    super();
    this.room = room;
    this.current_layout = {};

    this.room.on("layout_data_received", ({ from, payload }) => {
      if (from !== "" + room.user.id && payload.action) {
        let action = payload.action;

        //sent to respondents
        if (action === "get") {
          this.room.text_room.send_to("layout", from, {
            action: "set",
            layout: this.current_layout,
          });
        }
        if (action === "set" && payload.layout) {
          this.current_layout = payload.layout;
          this.active_answer = null;
        }
      }
    });
  }

  change() {
    this.room.text_room.send("layout", {
      action: "set",
      layout: this.current_layout,
    });
  }
}
export default LayoutData;
