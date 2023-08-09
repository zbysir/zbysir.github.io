export default ({sliders}) => {
  return <div className="my-3" x-data={`{ activeSlide: 0, slides: [${sliders.map((_, i) => i).join(", ")}] }`}>
    <div className="relative">
      {
        sliders.map((s, i) => (
          <div x-show={"activeSlide === " + i}>
            {s}
          </div>
        ))
      }
      {
        sliders.length>1 ? <div className="absolute inset-0	flex items-center">
          <div className="flex w-full h-10 justify-between">
            <button
              className="b-0 px-3 unrounded btn-icon bg-color-transparent cursor-pointer bg-gradient-to-r from-white/70"
              x-on:click="activeSlide = activeSlide === 0 ? slides.length-1 : activeSlide - 1">←
            </button>
            <button
              className="b-0 px-3 unrounded btn-icon bg-color-transparent cursor-pointer bg-gradient-to-l from-white/70"
              x-on:click="activeSlide = activeSlide === slides.length-1 ? 0 : activeSlide + 1">→
            </button>
          </div>

        </div> : null
      }

    </div>
  </div>
}
