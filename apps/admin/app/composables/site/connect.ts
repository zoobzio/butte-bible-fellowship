import type { ConnectForm, ConnectRecord } from "@bbf/schema/types";

import { connectForm, connectRecord } from "@bbf/schema";
import { toConnectBody, toConnectForm } from "@bbf/utils/vm";
import { useNuxtApp } from "#imports";
import { blank, useSiteEditor } from "~/composables/site/editor";
import { CONNECT } from "~/composables/site/routes";

/**
 * The form of the connect page's metadata: the title and the description
 * the page opens with, which the browser and search engines show for it
 * too, and how to find and reach the church, each a line of its cards: the
 * address, which its map is drawn from, the phone number, the fax number,
 * the email address, and the hours the office keeps, a line typed to a
 * line of the page. All but the title and the address may be left empty,
 * and the page then says nothing of it. What is written on the page is
 * written on its own, beside the form.
 */
export const useConnectEditor = (record: ConnectRecord) => {
  const { $t } = useNuxtApp();

  return useSiteEditor<ConnectForm, ConnectRecord>(record, {
    id: "connect",
    fields: [
      {
        type: "text",
        key: "title",
        label: $t.admin.page.title(),
        required: true,
      },
      {
        type: "textarea",
        key: "description",
        label: $t.admin.page.description(),
        rows: 3,
      },
      {
        type: "text",
        key: "address",
        label: $t.admin.connect.address(),
        hint: $t.admin.connect.addressHint(),
        required: true,
      },
      { type: "text", key: "phone", label: $t.admin.connect.phone() },
      { type: "text", key: "fax", label: $t.admin.connect.fax() },
      { type: "text", key: "email", label: $t.admin.connect.email() },
      {
        type: "textarea",
        key: "hours",
        label: $t.admin.connect.hours(),
        hint: $t.admin.connect.hoursHint(),
        rows: 4,
      },
    ],
    schema: connectForm,
    middleware: {
      description: blank,
      phone: blank,
      fax: blank,
      email: blank,
      hours: blank,
    },
    endpoint: CONNECT,
    record: connectRecord,
    toForm: toConnectForm,
    toBody: toConnectBody,
  });
};
