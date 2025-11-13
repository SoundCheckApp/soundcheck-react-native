import { PanelLeft } from 'lucide-react-native';
import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_WIDTH_ICON = 64;
const SIDEBAR_WIDTH_MOBILE = 288;

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
};

export const SidebarProvider = forwardRef(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { width } = Dimensions.get('window');
    const isMobile = width < 768;

    const [openMobile, setOpenMobile] = useState(false);
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const open = openProp ?? internalOpen;

    const setOpen = useCallback(
      (next) => {
        const value = typeof next === 'function' ? next(open) : next;
        if (setOpenProp) {
          setOpenProp(value);
        } else {
          setInternalOpen(value);
        }
      },
      [open, setOpenProp],
    );

    const toggleSidebar = useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev);
      } else {
        setOpen((prev) => !prev);
      }
    }, [isMobile, setOpen]);

    const state = open ? 'expanded' : 'collapsed';

    const contextValue = useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <View
          ref={ref}
          style={[styles.provider, style]}
          {...props}
        >
          {children}
        </View>
      </SidebarContext.Provider>
    );
  },
);

SidebarProvider.displayName = 'SidebarProvider';

export const Sidebar = forwardRef(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, open } = useSidebar();

    if (collapsible === 'none') {
      return (
        <View
          ref={ref}
          style={[
            styles.sidebar,
            { width: SIDEBAR_WIDTH },
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side={side} style={styles.sheetContentMobile}>
            <ScrollView contentContainerStyle={styles.mobileContent}>
              {children}
            </ScrollView>
          </SheetContent>
        </Sheet>
      );
    }

    const width =
      state === 'collapsed' && collapsible === 'icon'
        ? SIDEBAR_WIDTH_ICON
        : SIDEBAR_WIDTH;

    return (
      <View
        ref={ref}
        style={[
          styles.sidebar,
          side === 'right' && styles.sidebarRight,
          variant === 'floating' && styles.sidebarFloating,
          !open && collapsible === 'offcanvas' && styles.offcanvasCollapsed,
          { width },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
);

Sidebar.displayName = 'Sidebar';

export const SidebarTrigger = forwardRef(
  ({ style, onPress, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        style={[styles.triggerButton, style]}
        onPress={(event) => {
          onPress?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft size={18} color="#f4f4f5" />
      </Button>
    );
  },
);

SidebarTrigger.displayName = 'SidebarTrigger';

export const SidebarRail = ({ style }) => {
  const { toggleSidebar } = useSidebar();
  return (
    <TouchableOpacity
      style={[styles.rail, style]}
      onPress={toggleSidebar}
      accessibilityLabel="Toggle Sidebar"
    />
  );
};

export const SidebarInset = forwardRef(({ style, children, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.inset, style]}
    {...props}
  >
    {children}
  </View>
));

SidebarInset.displayName = 'SidebarInset';

export const SidebarInput = forwardRef(({ style, ...props }, ref) => (
  <Input
    ref={ref}
    style={[styles.input, style]}
    {...props}
  />
));

SidebarInput.displayName = 'SidebarInput';

export const SidebarHeader = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.header, style]} {...props} />
));

SidebarHeader.displayName = 'SidebarHeader';

export const SidebarFooter = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.footer, style]} {...props} />
));

SidebarFooter.displayName = 'SidebarFooter';

export const SidebarSeparator = forwardRef(({ style, ...props }, ref) => (
  <Separator ref={ref} style={[styles.separator, style]} {...props} />
));

SidebarSeparator.displayName = 'SidebarSeparator';

export const SidebarContent = forwardRef(({ style, children, ...props }, ref) => (
  <ScrollView
    ref={ref}
    contentContainerStyle={[styles.content, style]}
    {...props}
  >
    {children}
  </ScrollView>
));

SidebarContent.displayName = 'SidebarContent';

export const SidebarGroup = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.group, style]} {...props} />
));

SidebarGroup.displayName = 'SidebarGroup';

export const SidebarGroupLabel = forwardRef(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.groupLabel, style]} {...props}>
    <Text style={styles.groupLabelText}>{children}</Text>
  </View>
));

SidebarGroupLabel.displayName = 'SidebarGroupLabel';

export const SidebarGroupAction = forwardRef(({ style, children, onPress, ...props }, ref) => (
  <TouchableOpacity
    ref={ref}
    style={[styles.groupAction, style]}
    onPress={onPress}
    {...props}
  >
    {children}
  </TouchableOpacity>
));

SidebarGroupAction.displayName = 'SidebarGroupAction';

export const SidebarGroupContent = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.groupContent, style]} {...props} />
));

SidebarGroupContent.displayName = 'SidebarGroupContent';

export const SidebarMenu = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.menu, style]} {...props} />
));

SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.menuItem, style]} {...props} />
));

SidebarMenuItem.displayName = 'SidebarMenuItem';

export const SidebarMenuButton = forwardRef(
  (
    { style, isActive = false, onPress, children, ...props },
    ref,
  ) => (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.menuButton,
        isActive && styles.menuButtonActive,
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </TouchableOpacity>
  ),
);

SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarMenuAction = forwardRef(({ style, onPress, children, ...props }, ref) => (
  <TouchableOpacity
    ref={ref}
    style={[styles.menuAction, style]}
    onPress={onPress}
    {...props}
  >
    {children}
  </TouchableOpacity>
));

SidebarMenuAction.displayName = 'SidebarMenuAction';

export const SidebarMenuBadge = forwardRef(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.menuBadge, style]} {...props}>
    <Text style={styles.menuBadgeText}>{children}</Text>
  </View>
));

SidebarMenuBadge.displayName = 'SidebarMenuBadge';

export const SidebarMenuSkeleton = forwardRef(({ style, showIcon = false }, ref) => (
  <View ref={ref} style={[styles.menuSkeleton, style]}>
    {showIcon && <Skeleton style={styles.menuSkeletonIcon} />}
    <Skeleton style={styles.menuSkeletonText} />
  </View>
));

SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

export const SidebarMenuSub = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.menuSub, style]} {...props} />
));

SidebarMenuSub.displayName = 'SidebarMenuSub';

export const SidebarMenuSubItem = forwardRef(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.menuSubItem, style]} {...props} />
));

SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

export const SidebarMenuSubButton = forwardRef(
  ({ style, isActive = false, onPress, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.menuSubButton,
        isActive && styles.menuSubButtonActive,
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </TouchableOpacity>
  ),
);

SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
    backgroundColor: '#0f0f17',
  },
  sidebar: {
    height: '100%',
    backgroundColor: '#12121f',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sidebarRight: {
    marginLeft: 'auto',
  },
  sidebarFloating: {
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 16,
  },
  offcanvasCollapsed: {
    display: 'none',
  },
  sheetContentMobile: {
    width: SIDEBAR_WIDTH_MOBILE,
    padding: 0,
  },
  mobileContent: {
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  triggerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: 'transparent',
  },
  inset: {
    flex: 1,
    backgroundColor: '#0f0f17',
  },
  input: {
    height: 40,
    backgroundColor: '#1c1c2b',
  },
  header: {
    padding: 8,
    gap: 8,
  },
  footer: {
    padding: 8,
    gap: 8,
  },
  separator: {
    marginVertical: 8,
    backgroundColor: 'rgba(63,63,70,0.6)',
  },
  content: {
    gap: 8,
    padding: 8,
  },
  group: {
    padding: 8,
    gap: 8,
  },
  groupLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  groupLabelText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '600',
  },
  groupAction: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(63,63,70,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupContent: {
    gap: 6,
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    borderRadius: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  menuButtonActive: {
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  menuAction: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(63,63,70,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#e4e4e7',
    fontSize: 12,
    fontWeight: '600',
  },
  menuSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuSkeletonIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  menuSkeletonText: {
    flex: 1,
    height: 16,
    borderRadius: 4,
  },
  menuSub: {
    marginLeft: 16,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(63,63,70,0.6)',
    paddingLeft: 12,
    gap: 4,
  },
  menuSubItem: {
    paddingVertical: 4,
  },
  menuSubButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuSubButtonActive: {
    backgroundColor: 'rgba(99,102,241,0.16)',
  },
});

