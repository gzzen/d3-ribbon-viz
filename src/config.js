// Data source
export const data = {
	csvPath: 'data/student-por-processed.csv',
	defaultAttrs: ['studytime', 'failures', 'absences_levels', 'schoolsup', 'paid'],
	finalAttr: 'final_grade_levels',
};

// SVG viewport dimensions and CSS framing
// Design width = window.innerWidth - viewport.rightPad - viewport.sidebarWidth
export const viewport = {
	rightPad: 30,
	sidebarWidth: 160,
	height: 550,
	svgWidthStyle: 'calc(100% - 150px)',
	svgMarginLeft: '150px',
};

// Axis layout geometry
export const axis = {
	marginLeft: 80,
	marginRight: 80,
	marginTop: 25,
	marginBottom: 120,
	paddingInner: 30,
	nodePadding: 0,
};

// Node visual constants
export const node = {
	width: 20,
	widthHovered: 30,
	dimmedGrey: '#ffffff',
	dimmedGreyAmount: 0.6,
	selectedStroke: '#ffffff',
	selectedStrokeWidth: 2,
	hoverTransitionMs: 120,
	hoverFilterId: 'pc-node-hover-shadow',
};

// Ribbon base rendering opacities
export const ribbon = {
	baseOpacity: 0.5,
	dimmedOpacity: 0.05,
};

// Overlay highlight/dim visual constants
export const overlay = {
	greyColor: '#aaaaaa',
	highlightOpacity: 0.7,
	dimmedOpacity: 0.15,
	baseOpacity: 0.5,
};

// Legend layout and typography
export const legend = {
	y: 20,
	panelPadding: 10,
	attrLabelFontSize: 10,
	attrLabelColor: '#444',
	attrLabelWrapWidth: 20,
	columnGap: 10,
	columnWidth: 100,
	labelContentPadding: 25,
	swatchSize: 9,
	swatchGap: 3,
	swatchLabelGap: 6,
	swatchFontSize: 10,
	swatchLabelColor: '#222',
	gradientBarWidth: 12,
	gradientBarHeight: 40,
	gradientLabelGap: 6,
	gradientLabelOffset: 3,
	gradientLabelFontSize: 9,
	gradientLabelColor: '#222',
};
