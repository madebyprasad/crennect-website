# Projection Stall Walkthrough

A first-person 3D preview of the curved projection stall. Load the wall video or image and see how it looks from a visitor's eye level before the event.

Everything runs in the browser. Media files are never uploaded. They are read straight from the viewer's computer.

## Live link (GitHub Pages)

1. Create a new repository on GitHub and upload everything in this folder: `index.html`, `README.md`, `.nojekyll` and the `vendor` folder. Keep the folder structure as it is.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick the **main** branch and the **/ (root)** folder, then **Save**.
4. After a minute the page is live at `https://<your-username>.github.io/<repository-name>/`. Share that link.

`.nojekyll` is a hidden file. If your upload skips it, the site still works.

## Checking media

1. Open the link in Chrome, Edge or Safari on a laptop or desktop.
2. Under **Wall media**, choose how your content is split:
   - **One full-wall file**: click **Load image or video** (or drag a file onto the 3D view) for a single 8240 × 1200 file.
   - **3 part files**: click **Choose** next to Part 1, Part 2 and Part 3 to load a separate image or video for each zone, left to right as you face the wall. Parts you haven't filled stay white. Images and videos can be mixed. Part videos restart together whenever a new part video is added, and the play, mute and restart buttons control all of them at once.
3. The view opens **Inside the rope**. Pick another spot under **Stand here** and drag to look around.

Switching between the two modes keeps what you loaded in each one.

Media spec:

| | Pixels |
|---|---|
| Full wall, left to right | 8240 × 1200 |
| Each of the 3 parts | 2746 × 1200 |
| Each single projector | 1264 × 1200 |

Tips:

- Media is shown at its full resolution and with its exact colours, straight from the file, for both full-wall and part files. *Camera glow & vignette* (off by default) adds a photographic look but changes the colours. Use H.264 MP4 at the real size (8240 × 1200, or 2746 × 1200 per part) to judge sharpness.
- If a full-wall 8240 px video stutters on an older laptop, the 3-part option (three 2746 × 1200 files) is usually smoother, because each part is a normal-sized video.
- **Zone guides** (under *Show in model*) draws the 3-part split and the 1264 px blocks over the media.
- **Mapping on the wall** defaults to keeping the media's proportions. You can switch to edge-to-edge (how projectors map it) or to designed size (61.8 ft wide, edges cropped).

## Controls

| Action | How |
|---|---|
| Look around | Drag on the view |
| Walk | W A S D or arrow keys; Q / E to turn |
| Walk to a spot | Double-click (double-tap) the floor |
| Field of view | Scroll, or the *Field of view* slider (opens at 108°, very wide) |
| Perspective | *Natural* (default) keeps the edges of the view from stretching, like your eyes. *Camera lens* shows a straight photographic lens, which stretches the edges. |
| Your height | *Your height* slider (eyes sit about 4.5 in below the top of the head) |

## Options

What the page shows when it opens:

| Setting | Default |
|---|---|
| Standing spot | Inside the rope |
| Perspective | Natural, like your eyes |
| Picture quality | Smooth playback (draws the 3D view at a fixed, modest size so video stays smooth even full screen). *Sharper* needs a strong graphics card |
| Field of view | 108° (very wide) |
| Mapping on the wall | Keep media proportions |
| Wall | Sample video (`media/sample-video-smooth.mp4`), playing on loop. *Plain white* and *Test pattern* are one click away |
| Realism | On for computers, off for phones |
| People in the stall | Off |
| Rope & stanchions | Off |
| Side openings | Off (continuous wall) |
| Display pedestals | Off |
| Ceiling, truss & projectors | On |
| Floor reflection | 5%. Use the *Floor reflection* slider to set how strong it is |
| Camera glow & vignette | Off (they shift the media colours) |
| Floor | Black |

- **Realism**: guests in modern event outfits, lit only by the screen spill, with floor reflections and a soft camera glow. Turn off for a fast layout preview.
- **Show people in the stall**: tick it to add visitors (1–16) and see how they block the screen. *Rearrange visitors* shuffles them.
- **Projection brightness** and **House lights** sliders.

## Stall size

The model is built from the floor plan:

| | Feet |
|---|---|
| Booth | 24 × 15 |
| Curved room (width × depth) | 19.9 × 12.48 |
| Screen wall height | 9 |
| Entrance | 6 |
| Side openings | 2.02 |
| Rope area width | 13 |

Click **Edit dimensions** under *Stall size* to change any of these, then **Apply**. The whole stall is rebuilt and the measurements update. Edits are saved in that browser only. **Reset to plan** brings back the plan sizes.

### Note on wall length

At the floor plan's scale the curved wall runs about **46.2 ft**, not the 61.8 ft in the media spec. Mapped edge to edge, 8240 × 1200 content looks about 25% narrower than designed, so circles look tall. The *Measurements* panel shows this for whatever size is set.

If the real wall is 61.8 ft, click **Make the wall 61.8 ft (media spec)** under *Measurements*. It scales the whole stall so the wall matches the media and nothing is stretched. **Back to floor plan size** undoes it.

## Running it on your own computer

The page has to be served by a web server. Double-clicking `index.html` will not work, because browsers block the 3D modules on `file://` pages.

From this folder, run one of:

```
python3 -m http.server 8000
npx serve .
```

Then open http://localhost:8000.

## Files

- `index.html`: the whole app (layout, styles and 3D code).
- `media/sample-video-smooth.mp4`: the video the page opens with. It holds a 7904 × 1152 wall video stored as 3952 × 2304 (left half on top, right half below), so the computer's graphics hardware can decode it smoothly.
- `vendor/three/`: the parts of [three.js](https://threejs.org) r162 the app uses, bundled so the page doesn't depend on a CDN. MIT licensed, see `vendor/three/LICENSE`.

Fonts load from Google Fonts. Without internet the page falls back to system fonts and still works.

## Limits

- People are 3D figures, not photographic. Faces are simple, and they read best from behind and at a distance, which is how they are mostly seen.
- Shadows that visitors would cast on the projection, by standing between a projector and the wall, are not modelled.
- Realism mode is demanding. On older laptops the page lowers its own resolution to stay smooth, and turning Realism off is always fast.

## Smooth video playback

Most computers can only decode video in their graphics hardware up to **4096 px wide** (and about 9 million pixels per frame). An 8240 × 1200 video is over that limit, so the browser decodes it in software and it plays at a few frames per second. The page warns when a loaded file is too wide.

For smooth playback, use one of these:

- **3 part files**, each 2746 × 1200 H.264. Each one is inside the hardware limit, and the page keeps the three in step.
- **One file at 4096 px wide or less**, for example 4096 × 596.

To make a new opening video in the same smooth layout as the sample, run this with [ffmpeg](https://ffmpeg.org) (replace `input.mp4`), then save the result as `media/sample-video-smooth.mp4`:

```
ffmpeg -i input.mp4 -filter_complex "[0:v]scale=7904:1152,split[a][b];[a]crop=3952:1152:0:0[l];[b]crop=3952:1152:3952:0[r];[l][r]vstack[v]" -map "[v]" -map 0:a? -c:v libx264 -profile:v high -level:v 5.1 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart sample-video-smooth.mp4
```

### Checking performance

Add `#stats` to the end of the page address (for example `.../event-3d-stimulation#stats`) and reload. A small box shows how many frames per second the 3D view and the video are running at, and how many video frames were dropped.

- **Video below 25 fps or many dropped frames:** the computer is decoding the video in software. Check `chrome://gpu` shows *Video Decode: Hardware accelerated*.
- **3D view below 30 fps:** the graphics card is struggling. Keep **Picture quality** on *Smooth playback*, turn **Realism** off, or make the browser window smaller.
