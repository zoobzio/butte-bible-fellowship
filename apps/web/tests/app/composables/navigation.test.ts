import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { NavigationLink } from "~/types/navigation";

import {
  setAppConfig,
  setRouteBack,
  setRoutePath,
  useNuxtApp,
  useRouter,
} from "#imports";
import {
  useHeaderHeight,
  useNavigation,
  usePageBack,
} from "~/composables/navigation";
import { withSetup } from "@bbf/nuxt/testing/mount";

const LINKS: NavigationLink[] = [
  { label: "navigation.about", to: "/" },
  { label: "navigation.events", to: "/visit" },
  { label: "navigation.connect", to: "/contact" },
];

const { $t } = useNuxtApp();

describe("useNavigation", () => {
  beforeEach(() => {
    setAppConfig({ header: { links: LINKS } });
  });

  it("sets the configured links in order, in the reader's words", () => {
    const { links } = useNavigation();
    expect(links.value.map(({ label, to }) => [label, to])).toEqual([
      [$t.navigation.about(), "/"],
      [$t.navigation.events(), "/visit"],
      [$t.navigation.connect(), "/contact"],
    ]);
  });

  it("marks the link of the page being read, and the pages under it, and no other", () => {
    const { links } = useNavigation();
    const active = () => links.value.map((link) => link.active);
    setRoutePath("/visit");
    expect(active()).toEqual([false, true, false]);
    setRoutePath("/visit/sunday");
    expect(active()).toEqual([false, true, false]);
    setRoutePath("/");
    expect(active()).toEqual([true, false, false]);
  });

  it("leads home from the root", () => {
    expect(useNavigation().home).toBe("/");
  });
});

describe("usePageBack", () => {
  it("leads up to the page this one is under", () => {
    setRoutePath("/events/potluck");
    expect(usePageBack().up.value).toBe("/events");
    setRoutePath("/events");
    expect(usePageBack().up.value).toBe("/");
  });

  it("steps back to the page that brought the reader here", () => {
    setRoutePath("/events/potluck");
    setRouteBack("/");
    usePageBack().leave();
    expect(useRouter().back).toHaveBeenCalledOnce();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("goes up when no page of the site brought the reader here", () => {
    setRoutePath("/events/potluck");
    usePageBack().leave();
    expect(useRouter().push).toHaveBeenCalledExactlyOnceWith("/events");
    expect(useRouter().back).not.toHaveBeenCalled();
  });
});

describe("useHeaderHeight", () => {
  const element = (height: number) => {
    const el = document.createElement("header");
    Object.defineProperty(el, "offsetHeight", {
      get: () => height,
      configurable: true,
    });
    return el;
  };

  const published = () =>
    document.documentElement.style.getPropertyValue("--header-height");

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.style.removeProperty("--header-height");
  });

  it("publishes the element's height to the root while mounted", () => {
    const { wrapper } = withSetup(() => useHeaderHeight(ref(element(72))));
    expect(published()).toBe("72px");
    wrapper.unmount();
    expect(published()).toBe("");
  });

  it("publishes nothing without an element", () => {
    withSetup(() => useHeaderHeight(ref(null)));
    expect(published()).toBe("");
  });

  it("measures again as the element resizes, and stops watching on unmount", () => {
    const observers: {
      callback: () => void;
      observed: Element[];
      disconnected: boolean;
    }[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observed: Element[] = [];
        disconnected = false;
        constructor(public callback: () => void) {
          observers.push(this);
        }
        observe(target: Element) {
          this.observed.push(target);
        }
        disconnect() {
          this.disconnected = true;
        }
      },
    );

    const el = element(72);
    const { wrapper } = withSetup(() => useHeaderHeight(ref(el)));
    expect(observers.length).toBe(1);
    expect(observers[0]!.observed).toEqual([el]);

    Object.defineProperty(el, "offsetHeight", {
      get: () => 96,
      configurable: true,
    });
    observers[0]!.callback();
    expect(published()).toBe("96px");

    wrapper.unmount();
    expect(observers[0]!.disconnected).toBe(true);
  });
});
