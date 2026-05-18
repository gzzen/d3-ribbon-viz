// Data source
export const data = {
	csvPath: 'data/student-por-processed.csv',
	defaultAttrs: ['studytime', 'failures', 'schoolsup', 'paid'],
	targetAttr: 'final_grade_levels',
};

// SVG viewport sizing — fractions of window dimensions
// Design width  = window.innerWidth  × (1 - rightPadFraction - sidebarFraction)
// Design height = window.innerHeight × heightFraction
export const viewport = {
	rightPadFraction:  0.1,   // right whitespace
	sidebarFraction:   0.11,   // left sidebar / navigation
	heightFraction:    0.50,   // SVG height relative to window height
	// CSS strings derived from sidebarFraction so they stay consistent
	get svgWidthStyle()  { return `calc(100% - ${this.sidebarFraction * 100}vw)`; },
	get svgMarginLeft()  { return `${this.sidebarFraction * 100}vw`; },
};

// Axis layout geometry — fractions of the SVG coordinate dimensions
export const axis = {
	marginLeftFraction:    0.065,  // left margin as fraction of SVG width
	marginRightFraction:   0.065,  // right margin as fraction of SVG width
	marginTopFraction:     0.35,   // top margin as fraction of SVG height (legend space)
	marginBottomFraction:  0.05,   // bottom margin as fraction of SVG height
	paddingInnerFraction:  0,  // inner top/bottom padding as fraction of SVG height
	// labelOffsetFraction:   0.018,  // axis label Y offset above axis column as fraction of SVG height
	nodePadding: 0,                // gap between adjacent nodes, in SVG coordinate units
};

// Node visual constants (SVG coordinate units — scale implicitly with viewBox)
export const node = {
	width: 50,
	widthHovered: 55,
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

// Legend layout and typography (SVG coordinate units)
export const legend = {
	y: 20,
	panelPadding: 10,
	attrLabelFontSize: 10,
	attrLabelColor: '#444',
	attrLabelWrapWidth: 20,
	columnGap: 15,
	columnWidth: 100,
	labelContentPadding: 30,
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
